import path from "path";
import { AnalyzerProject } from "../model";
import { AnalyzerBlockCode } from "../block/model";
import { extractCommentsFromText } from "../comment/model";
import type {
	ProjectExport,
} from "../types";
import ts from "typescript";
import { ProjectBlockCode, ExportStatus } from "../block/types";
import { ProjectComment } from "../comment/types";
import { extractJsDoc } from "../jsdoc";


export class ProjectFile {
	private _sourceFile?: ts.SourceFile;
	private _blocks?: ProjectBlockCode[];
	private _exports?: ProjectExport[];
	private _standaloneComments?: ProjectComment[];

	constructor(
		public readonly name: string,
		public readonly ext: string,
		public readonly relativePath: string,
		public readonly absolutePath: string,
		public readonly parentProject: AnalyzerProject,
	) {}

	public getSourceFile(): ts.SourceFile {
		if (!this._sourceFile) {
			const sf = this.parentProject.getProgram()?.getSourceFile(this.absolutePath);
			if (!sf) throw new Error(`Não foi possível carregar o SourceFile: ${this.absolutePath}`);
			this._sourceFile = sf;
		}
		return this._sourceFile;
	}

	public getText(): string {
		return this.getSourceFile().text;
	}

	get blocks(): ProjectBlockCode[] {
		if (!this._blocks) {
			this.processFileStructure();
		}
		return this._blocks!;
	}

	get exports(): ProjectExport[] {
		if (!this._exports) {
			this.processFileStructure();
		}
		return this._exports!;
	}

	get standaloneComments(): (ProjectComment|undefined)[] {
		if (!this._standaloneComments) {
			this._standaloneComments = [];
			const sf = this.getSourceFile();

			const trivia = sf.getFullText();
			const leadingTrivia = trivia.substring(0, sf.getStart());
			this._standaloneComments.push(...extractCommentsFromText(leadingTrivia, 0, sf));

			const parseComments = (node: ts.Node) => {
				const fullText = node.getFullText(sf);
				const nodeStart = node.getStart(sf);
				const nodeFullStart = node.getFullStart();

				if (nodeStart > nodeFullStart) {
					const nodeTrivia = fullText.substring(0, nodeStart - nodeFullStart);
					this._standaloneComments!.push(
						...extractCommentsFromText(nodeTrivia, nodeFullStart, sf),
					);
				}
				ts.forEachChild(node, parseComments);
			};

			ts.forEachChild(sf, parseComments);
		}
		return this._standaloneComments;
	}

	private processFileStructure() {
		if (this._blocks !== undefined && this._exports !== undefined) {
			if (this._blocks.length === 0 && this._exports.length === 0) return;
		}

		this._blocks = [];
		this._exports = [];

		const sf = this.getSourceFile();
		const program = this.parentProject.getProgram();
		if (!program) return;
		const checker = program.getTypeChecker();

		const resolveCategory = (name: string): ProjectBlockCode["category"] => {
			for (const file of this.parentProject.files) {
				if (file === this) continue;
				const b = file.blocks.find((block) => block.name === name);
				if (b && b.category !== "unknown") {
					return b.category;
				}
			}
			return "unknown";
		};

		// Walks only the statement list of the module itself (and, one level in, the statement
		// list of a `declare global {}`/`declare module "x" {}` body) — never into a function,
		// method, or arrow body. This used to be a full `ts.forEachChild` tree walk that kept
		// recursing after creating a block, which meant every local `const`/helper function
		// declared *inside* a function body (loop counters, intermediate results, nested
		// closures — anything using the same node kinds as a real module-level declaration) was
		// picked up as if it were its own top-level export candidate. Harmless for the index/
		// validator (they only look at `file.exports`), but it flooded the docs generator (which
		// walks every block) with entries like `keys`/`seen`/`aVal` that are just local variables
		// inside `_Object.diffs`/mask-parsing functions, not real declarations.
		const visitStatements = (statements: readonly ts.Statement[], context: ProjectBlockCode["context"]) => {
			for (const node of statements) {
				if (ts.isModuleDeclaration(node)) {
					const name = node.name.getText(sf);
					const body = node.body;
					if (!body || !ts.isModuleBlock(body)) continue;

					if (name === "global") {
						visitStatements(body.statements, "global");
					} else if (name.startsWith(".") || name === "require" || name === "node") {
						visitStatements(body.statements, "module");
					}
					continue;
				}

				if (ts.isVariableStatement(node)) {
					for (const decl of node.declarationList.declarations) {
						if (ts.isObjectBindingPattern(decl.name)) {
							this.createBlocksFromBindingPattern(decl, node, checker, sf, context);
						} else {
							this.createBlockFromNode(decl, "const", node, checker, sf, context);
						}
					}
					continue;
				}

				if (
					ts.isClassDeclaration(node) ||
					ts.isInterfaceDeclaration(node) ||
					ts.isTypeAliasDeclaration(node) ||
					ts.isFunctionDeclaration(node) ||
					ts.isEnumDeclaration(node)
				) {
					let category: ProjectBlockCode["category"] = "unknown";
					if (ts.isClassDeclaration(node)) category = "class";
					else if (ts.isInterfaceDeclaration(node)) category = "interface";
					else if (ts.isTypeAliasDeclaration(node)) category = "type";
					else if (ts.isFunctionDeclaration(node)) category = "function";
					else if (ts.isEnumDeclaration(node)) category = "enum";

					this.createBlockFromNode(node, category, node, checker, sf, context);
				}
			}
		};

		visitStatements(sf.statements, "local");

		const localReexports = new Set<ProjectBlockCode>();

		const processExportNodes = (node: ts.Node) => {
			const addExport = (
				name: string,
				isDefault: boolean,
				anchorNode: ts.Node,
				typeOnly: boolean,
			) => {
				const existing = this._exports!.find(
					(e) => e.name === name && e.isDefault === isDefault,
				);
				if (existing) return;

				const block = this._blocks!.find((b) => b.name === name);
				if (block) {
					if (block.exportStatus === "not-exported") {
						localReexports.add(block);
					}
					this._exports!.push({ name, isDefault, blockCode: block });
					return;
				}

				const newBlock = new AnalyzerBlockCode(
					name,
					typeOnly ? "type" : resolveCategory(name),
					"local",
					typeOnly,
					"local-reexport",
					{ file: this.relativePath, start: 0, end: 0, startLine: 0, endLine: 0 },
					this,
					anchorNode,
					undefined,
				);
				this._blocks!.push(newBlock);
				this._exports!.push({ name, isDefault, blockCode: newBlock });
			};

			if (ts.isExportDeclaration(node)) {
				if (!node.exportClause) return;

				const isTypeOnly = (node as any).isTypeOnly === true || ts.isTypeOnlyExportDeclaration(node);

				if (ts.isNamedExports(node.exportClause)) {
					for (const spec of node.exportClause.elements) {
						addExport(spec.name.getText(sf), false, spec, isTypeOnly);
					}
				}
			} else if (ts.isExportAssignment(node)) {
				const expr = node.expression;
				const name = expr && ts.isIdentifier(expr) ? expr.getText(sf) : "default";
				addExport(name, true, expr || node, false);
			}

			ts.forEachChild(node, processExportNodes);
		};

		ts.forEachChild(sf, processExportNodes);

		for (const block of localReexports) {
			block.exportStatus = "local-reexport";
		}
	}

	/**
	 * Resolves documentation through a simple alias initializer (`const x = Foo.bar`) by
	 * following the property access back to the symbol it actually came from — e.g. a static
	 * method inside a `_Foo` implementation class — so docs written at the real declaration
	 * are found instead of the re-exporting statement having none of its own.
	 */
	private resolveAliasedDocumentation(
		expr: ts.Expression,
		checker: ts.TypeChecker,
		sf: ts.SourceFile,
	): AnalyzerBlockCode["documentation"] {
		if (!ts.isPropertyAccessExpression(expr)) return undefined;
		const symbol = checker.getSymbolAtLocation(expr.name);
		const decl = symbol?.declarations?.[0];
		return decl ? extractJsDoc(decl, sf) : undefined;
	}

	private categoryFromDeclaration(decl: ts.Declaration): ProjectBlockCode["category"] {
		if (
			ts.isMethodDeclaration(decl) ||
			ts.isFunctionDeclaration(decl) ||
			ts.isFunctionExpression(decl) ||
			ts.isArrowFunction(decl) ||
			ts.isPropertyDeclaration(decl)
		) {
			return "function";
		}
		return "unknown";
	}

	/**
	 * A destructuring `const { a, b } = _Foo` used to collapse into one block named after the
	 * whole binding pattern's source text (never matching `a`/`b`), which made
	 * `processExportNodes` synthesize undocumented placeholder blocks for every name in the
	 * matching `export { a, b }` list regardless of whether `_Foo.a`/`_Foo.b` actually had docs.
	 * This creates one real block per destructured name instead, resolving its documentation
	 * from the property it was actually destructured from.
	 */
	private createBlocksFromBindingPattern(
		decl: ts.VariableDeclaration,
		anchorStatement: ts.VariableStatement,
		checker: ts.TypeChecker,
		sf: ts.SourceFile,
		context: ProjectBlockCode["context"],
	) {
		const pattern = decl.name as ts.ObjectBindingPattern;
		if (!decl.initializer) return;
		const initializerType = checker.getTypeAtLocation(decl.initializer);

		const isExported = ts.canHaveModifiers(anchorStatement)
			? (ts.getModifiers(anchorStatement)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false)
			: false;

		for (const element of pattern.elements) {
			if (!ts.isIdentifier(element.name)) continue;
			const localName = element.name.getText(sf);
			const propertyName =
				element.propertyName && ts.isIdentifier(element.propertyName)
					? element.propertyName.getText(sf)
					: localName;

			const propSymbol = initializerType.getProperty(propertyName);
			const propDecl = propSymbol?.declarations?.[0];
			const documentation = propDecl ? extractJsDoc(propDecl, sf) : undefined;

			const exportStatus: ExportStatus = isExported ? "declaration-export" : "not-exported";

			const startPos = element.getStart(sf);
			const endPos = element.getEnd();
			const startLine = sf.getLineAndCharacterOfPosition(startPos).line + 1;
			const endLine = sf.getLineAndCharacterOfPosition(endPos).line + 1;

			const category = propDecl ? this.categoryFromDeclaration(propDecl) : "unknown";

			const block = new AnalyzerBlockCode(
				localName,
				category,
				context,
				false,
				exportStatus,
				{ file: this.relativePath, start: startPos, end: endPos, startLine, endLine },
				this,
				element,
				documentation,
			);

			this._blocks!.push(block);

			if (exportStatus === "declaration-export") {
				this._exports!.push({ name: localName, isDefault: false, blockCode: block });
			}
		}
	}

	private createBlockFromNode(
		targetNode: ts.NamedDeclaration | ts.VariableDeclaration,
		category: ProjectBlockCode["category"],
		anchorNode: ts.Node,
		checker: ts.TypeChecker,
		sf: ts.SourceFile,
		context: ProjectBlockCode["context"] = "local",
	) {
		if (!targetNode.name) return;
		const name = targetNode.name.getText(sf);

		let exportStatus: ExportStatus = "not-exported";
		if (ts.canHaveModifiers(anchorNode)) {
			const modifiers = ts.getModifiers(anchorNode);
			if (modifiers) {
				exportStatus = modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
					? "declaration-export"
					: "not-exported";
			}
		}

		let isTypeOnly = category === "interface" || category === "type";
		const symbol = checker.getSymbolAtLocation(targetNode.name);

		if (symbol) {
			const typeOnlyFlags = ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias;
			if (symbol.flags & typeOnlyFlags) {
				const runtimeFlags =
					ts.SymbolFlags.Class |
					ts.SymbolFlags.Enum |
					ts.SymbolFlags.Function |
					ts.SymbolFlags.Variable;
				isTypeOnly = !(symbol.flags & runtimeFlags);
			}
		}

		const startPos = anchorNode.getStart(sf);
		const endPos = anchorNode.getEnd();
		const startLine = sf.getLineAndCharacterOfPosition(startPos).line + 1;
		const endLine = sf.getLineAndCharacterOfPosition(endPos).line + 1;

		let documentation = extractJsDoc(anchorNode, sf);

		if (!documentation && ts.isVariableDeclaration(targetNode) && targetNode.initializer) {
			documentation = this.resolveAliasedDocumentation(targetNode.initializer, checker, sf);
		}

		const block = new AnalyzerBlockCode(
			name,
			category,
			context,
			isTypeOnly,
			exportStatus,
			{ file: this.relativePath, start: startPos, end: endPos, startLine, endLine },
			this,
			anchorNode,
			documentation,
		);

		this._blocks!.push(block);

		if (exportStatus === "declaration-export") {
			let isDefault = false;
			if (ts.canHaveModifiers(anchorNode)) {
				const modifiers = ts.getModifiers(anchorNode);
				if (modifiers) {
					isDefault = modifiers.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
				}
			}
			this._exports!.push({ name, isDefault, blockCode: block });
		}
	}

	public clearCache() {
		this._sourceFile = undefined;
		this._blocks = undefined;
		this._exports = undefined;
		this._standaloneComments = undefined;
	}
}