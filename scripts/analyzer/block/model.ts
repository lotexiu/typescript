import ts from "typescript";
import { ProjectFile } from "../file/model";
import { ExportStatus, JSDocTag, ProjectBlockCode, TBlockMember } from "./types";
import { extractJsDoc, hasDocContent } from "../jsdoc";

export class AnalyzerBlockCode implements ProjectBlockCode {
	private _importedBy?: readonly ProjectFile[];

	constructor(
		public readonly name: string,
		public readonly category: ProjectBlockCode["category"],
		public readonly context: ProjectBlockCode["context"],
		public readonly isTypeOnly: boolean,
		public exportStatus: ExportStatus,
		public readonly location: ProjectBlockCode["location"],
		public readonly parentFile: ProjectFile,
		private readonly node: ts.Node,
		public readonly documentation?: {
			readonly description: string;
			readonly tags: JSDocTag[];
		},
	) {}

	public getText(): string {
		return this.node.getText(this.parentFile.getSourceFile());
	}

	public getAstNode(): ts.Node {
		return this.node;
	}

	/** Whether this block is tagged `@internal` — excluded from the public entry/docs surface. */
	public isInternal(): boolean {
		return this.documentation?.tags.some((t) => t.name === "internal") ?? false;
	}

	/**
	 * For a class block, lists its public members (methods/properties — constructors and
	 * `private` members excluded) with documentation resolved the same way a consumer reading
	 * the code would find it: a member's own JSDoc if it has one, otherwise — for a simple
	 * `x = Foo.bar` alias property (the shape every `FooUtils` wrapper member and every `_Foo`
	 * class-conversion-in-progress object literal uses) — the JSDoc of whatever it aliases,
	 * following one extra hop through a shorthand/property object-literal member if needed (the
	 * `const _Mask = { compile, apply }` shape used by modules not yet converted to the `_Foo`
	 * class pattern). Used by both the missing-docs validator rule and the docs generator, so a
	 * method like `_Object.isObject` is caught/rendered the same way either place looks at it —
	 * neither used to see past a whole class as one opaque unit.
	 */
	public getMembers(): TBlockMember[] {
		if (this.category !== "class" || !ts.isClassDeclaration(this.node)) return [];

		const checker = this.parentFile.parentProject.getProgram()?.getTypeChecker();
		if (!checker) return [];
		const sf = this.parentFile.getSourceFile();

		const isInternalMember = (node: ts.Node): boolean => {
			const jsDocNodes = (node as any).jsDoc as ts.JSDoc[] | undefined;
			return !!jsDocNodes?.some((doc) =>
				doc.tags?.some((t) => t.tagName.getText(sf) === "internal"),
			);
		};

		// Follows one more hop past a shorthand/property object-literal member to the actual
		// function declaration it refers to, so JSDoc on e.g. `function compile(...)` is found
		// instead of stopping at the property assignment inside `const _Mask = { compile }`.
		const resolveThroughObjectLiteralMember = (decl: ts.Declaration): AnalyzerBlockCode["documentation"] => {
			const ownDoc = extractJsDoc(decl, sf);
			if (hasDocContent(ownDoc)) return ownDoc;
			if (!ts.isShorthandPropertyAssignment(decl) && !ts.isPropertyAssignment(decl)) return undefined;

			const valueSymbol = ts.isShorthandPropertyAssignment(decl)
				? checker.getShorthandAssignmentValueSymbol(decl)
				: (decl.initializer ? checker.getSymbolAtLocation(decl.initializer) : undefined);
			const valueDecl = valueSymbol?.declarations?.[0];
			return valueDecl ? extractJsDoc(valueDecl, sf) : undefined;
		};

		const members: TBlockMember[] = [];

		for (const member of this.node.members) {
			if (ts.isConstructorDeclaration(member)) continue;
			if (!ts.isPropertyDeclaration(member) && !ts.isMethodDeclaration(member)) continue;
			if (member.name && ts.isPrivateIdentifier(member.name)) continue;

			const modifiers = ts.canHaveModifiers(member) ? ts.getModifiers(member) : undefined;
			if (modifiers?.some((m) => m.kind === ts.SyntaxKind.PrivateKeyword)) continue;

			const memberName = member.name ? member.name.getText(sf) : "<unknown>";
			const startLine = sf.getLineAndCharacterOfPosition(member.getStart(sf)).line + 1;

			let documentation = extractJsDoc(member, sf);
			let aliasOf: string | undefined;

			if (
				!hasDocContent(documentation) &&
				ts.isPropertyDeclaration(member) &&
				member.initializer &&
				ts.isPropertyAccessExpression(member.initializer)
			) {
				aliasOf = member.initializer.getText(sf);
				const symbol = checker.getSymbolAtLocation(member.initializer.name);
				const decl = symbol?.declarations?.[0];
				documentation = decl ? resolveThroughObjectLiteralMember(decl) : undefined;
			}

			members.push({
				name: memberName,
				startLine,
				isInternal: isInternalMember(member),
				aliasOf,
				documentation,
			});
		}

		return members;
	}

	/**
	 * Public, non-`@internal` members with no discoverable documentation — see `getMembers()`
	 * for how "discoverable" is resolved through aliasing. This is what catches a method like
	 * `_Object.isObject` having no doc anywhere: the top-level export/documentation checks only
	 * ever look at whole blocks (a class as one unit), so an individual undocumented method never
	 * surfaced unless it happened to be destructured or const-aliased elsewhere.
	 */
	public getUndocumentedMembers(): { name: string; message: string }[] {
		return this.getMembers()
			.filter((m) => !m.isInternal && !(m.documentation?.description.trim() || m.documentation?.tags.length))
			.map((m) => ({
				name: m.name,
				message: m.aliasOf
					? `Member "${this.name}.${m.name}" (aliasing "${m.aliasOf}") has no documentation.`
					: `Member "${this.name}.${m.name}" has no documentation.`,
			}));
	}

	get importedBy(): readonly ProjectFile[] {
		if (this._importedBy) return this._importedBy;

		if (this.exportStatus === "not-exported") {
			this._importedBy = [];
			return this._importedBy;
		}

		const graph = this.parentFile.parentProject.getReferenceGraph();
		const set = graph.get(this.name);
		if (!set || set.size === 0) {
			this._importedBy = [];
			return this._importedBy;
		}

		const result = Array.from(set).filter((f) => f.relativePath !== this.parentFile.relativePath);
		this._importedBy = result;
		return this._importedBy;
	}
}
