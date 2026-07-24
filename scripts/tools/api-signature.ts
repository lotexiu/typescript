import ts from "typescript";
import { ProjectBlockCode } from "../analyzer/block/types";

function collapseWhitespace(text: string): string {
	return text.replace(/\s+/g, " ").trim();
}

/**
 * Base/head snapshots come from two different `ts.Program` instances (a `git worktree`
 * checkout vs. the real working copy). When the checker can't print a type via a clean
 * name it can fall back to an `import("/abs/path/...")` string containing the temp
 * worktree's absolute path — different between the two runs, which would read as a false
 * "changed" unrelated to any real change. Strip it before comparing.
 */
function stripProjectRoot(text: string, projectDir: string): string {
	if (!projectDir) return text;
	return text.split(projectDir).join("<root>");
}

/**
 * A `const` block's anchor node is the wrapping `VariableStatement`, not the inner
 * `VariableDeclaration` — a single statement can declare more than one binding
 * (`ProjectFile.createBlockFromNode` anchors each block at the statement, not the
 * declaration) — so the matching declaration has to be located by the exported name.
 */
function getNameNode(node: ts.Node, exportedName: string): ts.Node {
	if (ts.isVariableStatement(node)) {
		const decl = node.declarationList.declarations.find((d) => ts.isIdentifier(d.name) && d.name.text === exportedName);
		if (decl && ts.isIdentifier(decl.name)) return decl.name;
		return node;
	}
	if (
		ts.isVariableDeclaration(node) ||
		ts.isFunctionDeclaration(node) ||
		ts.isClassDeclaration(node) ||
		ts.isEnumDeclaration(node)
	) {
		return node.name ?? node;
	}
	if (ts.isExportSpecifier(node)) return node.name;
	// A destructured export (`const { isNull } = _Object;`) is anchored at the individual
	// `BindingElement`, not a `VariableDeclaration`/`VariableStatement` — without this, the
	// checker call below silently fails to resolve a symbol and the caller falls back to raw
	// source text (just the bare name), which reads as the export's signature having vanished
	// on every single destructured/aliased export, even when the aliased implementation is
	// byte-for-byte unchanged.
	if (ts.isBindingElement(node) && ts.isIdentifier(node.name)) return node.name;
	return node;
}

function relativeToProject(absolutePath: string, projectDir: string): string {
	if (!projectDir || !absolutePath.startsWith(projectDir)) return absolutePath;
	return absolutePath.slice(projectDir.length).replace(/^[\\/]/, "").replace(/\\/g, "/");
}

const bodyPrinter = ts.createPrinter({ removeComments: true });

/**
 * Follows a pass-through alias (`static readonly clamp = _Math.clamp;`, the
 * `FooUtils`/`_Foo` delegation pattern used throughout this repo) to the declaration
 * that actually has a body, so a behavior change made only to `_Foo.bar`'s
 * implementation — signature untouched — is still attributable to the public
 * `FooUtils.bar` member instead of silently invisible to the API diff. Stops as soon
 * as a node with no further alias-able initializer is reached (a real function/method
 * body, or a plain value with nothing to follow).
 */
function resolveImplementationDeclaration(checker: ts.TypeChecker, declaration: ts.Declaration | undefined): ts.Declaration | undefined {
	if (!declaration) return undefined;
	if (ts.isPropertyDeclaration(declaration) && declaration.initializer) {
		const initializer = declaration.initializer;
		if (ts.isPropertyAccessExpression(initializer) || ts.isIdentifier(initializer)) {
			const targetSymbol = checker.getSymbolAtLocation(ts.isPropertyAccessExpression(initializer) ? initializer.name : initializer);
			const targetDeclaration = targetSymbol?.valueDeclaration;
			if (targetDeclaration && targetDeclaration !== declaration) {
				return resolveImplementationDeclaration(checker, targetDeclaration) ?? targetDeclaration;
			}
		}
	}
	return declaration;
}

/** Only function/method-shaped declarations have a meaningful "body" worth diffing for behavior changes. */
function isFunctionLikeDeclaration(node: ts.Declaration): node is ts.MethodDeclaration | ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction {
	return (
		ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)
	);
}

/**
 * A member's implementation, resolved through any pass-through alias, printed
 * comment-free — `undefined` when the member (after following aliases) isn't
 * function-shaped, since a plain value has no "body" distinct from its already-
 * compared type signature.
 */
function getMemberBody(
	checker: ts.TypeChecker,
	memberSymbol: ts.Symbol,
	projectDir: string,
): { bodyText: string; implementationFile: string } | undefined {
	const declaration = resolveImplementationDeclaration(checker, memberSymbol.valueDeclaration);
	if (!declaration || !isFunctionLikeDeclaration(declaration) || !declaration.body) return undefined;

	const sourceFile = declaration.getSourceFile();
	const bodyText = bodyPrinter.printNode(ts.EmitHint.Unspecified, declaration.body, sourceFile);
	return {
		bodyText: stripProjectRoot(collapseWhitespace(bodyText), projectDir),
		implementationFile: relativeToProject(sourceFile.fileName, projectDir),
	};
}

function printSignatureOfSymbol(checker: ts.TypeChecker, symbol: ts.Symbol, atNode: ts.Node): string {
	const type = checker.getTypeOfSymbolAtLocation(symbol, atNode);
	const callSignatures = type.getCallSignatures();
	if (callSignatures.length > 0) {
		return callSignatures
			.map((sig) => checker.signatureToString(sig, atNode, undefined, ts.TypeFormatFlags.NoTruncation))
			.join(" | ");
	}
	return checker.typeToString(type, atNode, ts.TypeFormatFlags.NoTruncation);
}

export interface TClassMemberSignature {
	/** Qualified as `static.<name>` or `instance.<name>` so a static/instance member pair sharing a bare name never collides. */
	name: string;
	signature: string;
	/** Present only when the member (after following a pass-through alias) is function-shaped. */
	bodyText?: string;
	/** File the resolved implementation actually lives in — may differ from the class's own file for an aliased member. */
	implementationFile?: string;
}

/**
 * Per-member signatures for a class, used to diff at member granularity instead of
 * treating the whole class as one opaque blob — see `api-diff.ts`'s class-aware
 * branch, added so that adding a brand-new static method to an existing class reads
 * as a member-level `added` (feat/minor), not a class-level `changed` (fix/major)
 * just because the class's flattened signature text differs.
 */
function getClassMemberList(
	checker: ts.TypeChecker,
	classNode: ts.ClassDeclaration,
	classSymbol: ts.Symbol,
): TClassMemberSignature[] {
	const printMember = (memberSymbol: ts.Symbol, prefix: string): TClassMemberSignature => {
		const type = checker.getTypeOfSymbolAtLocation(memberSymbol, classNode);
		return {
			name: `${prefix}.${memberSymbol.getName()}`,
			signature: checker.typeToString(type, classNode, ts.TypeFormatFlags.NoTruncation),
		};
	};

	const staticMembers = classSymbol.exports ? Array.from(classSymbol.exports.values()) : [];
	const instanceMembers = classSymbol.members ? Array.from(classSymbol.members.values()) : [];

	return [...staticMembers.map((m) => printMember(m, "static")), ...instanceMembers.map((m) => printMember(m, "instance"))].sort(
		(a, b) => a.name.localeCompare(b.name),
	);
}

function printClassSignature(members: TClassMemberSignature[]): string {
	const staticText = members
		.filter((m) => m.name.startsWith("static."))
		.map((m) => `${m.name.slice("static.".length)}: ${m.signature}`)
		.join("; ");
	const instanceText = members
		.filter((m) => m.name.startsWith("instance."))
		.map((m) => `${m.name.slice("instance.".length)}: ${m.signature}`)
		.join("; ");

	return `static { ${staticText} } instance { ${instanceText} }`;
}

/**
 * `undefined` for anything that isn't a resolvable class declaration — callers treat
 * that as "no member-level breakdown available, fall back to whole-signature diffing".
 */
export function getClassMemberSignatures(block: ProjectBlockCode, projectDir: string): TClassMemberSignature[] | undefined {
	if (block.category !== "class") return undefined;
	const program = block.parentFile.parentProject.getProgram();
	if (!program) return undefined;
	const checker = program.getTypeChecker();
	const node = block.getAstNode();
	if (!ts.isClassDeclaration(node) || !node.name) return undefined;

	try {
		const classSymbol = checker.getSymbolAtLocation(node.name);
		if (!classSymbol) return undefined;

		const staticMembers = classSymbol.exports ? Array.from(classSymbol.exports.entries()) : [];
		const instanceMembers = classSymbol.members ? Array.from(classSymbol.members.entries()) : [];

		const build = ([, memberSymbol]: [string, ts.Symbol], prefix: string): TClassMemberSignature => {
			const type = checker.getTypeOfSymbolAtLocation(memberSymbol, node);
			const body = getMemberBody(checker, memberSymbol, projectDir);
			return {
				name: `${prefix}.${memberSymbol.getName()}`,
				signature: stripProjectRoot(collapseWhitespace(checker.typeToString(type, node, ts.TypeFormatFlags.NoTruncation)), projectDir),
				bodyText: body?.bodyText,
				implementationFile: body?.implementationFile,
			};
		};

		return [...staticMembers.map((m) => build(m, "static")), ...instanceMembers.map((m) => build(m, "instance"))].sort((a, b) =>
			a.name.localeCompare(b.name),
		);
	} catch {
		return undefined;
	}
}

/**
 * A normalized signature string for a block, used only to detect whether a public
 * export's *shape* changed between two snapshots — never rendered to a human, so
 * ugliness (recursive conditional types, etc.) is irrelevant here, unlike in docs-generator.
 *
 * Interface/type/enum declarations are printed from their own source text verbatim — that
 * text already *is* the full definition, with no checker synthesis involved, so it's safe
 * to compare across two different `ts.Program` instances. Function/const/class exports go
 * through the checker instead: a huge share of this library's public surface is the
 * `FooUtils.method = _Foo.method` delegation pattern (`const isNull = _Object.isNull;`),
 * whose own source text never changes even when `_Object.isNull`'s real signature does —
 * only asking the checker for the resolved type catches that.
 */
export function getSignatureText(block: ProjectBlockCode, projectDir: string): string {
	if (block.category === "interface" || block.category === "type" || block.category === "enum") {
		return collapseWhitespace(block.getText());
	}

	const program = block.parentFile.parentProject.getProgram();
	if (!program) return collapseWhitespace(block.getText());
	const checker = program.getTypeChecker();
	const node = block.getAstNode();

	try {
		if (block.category === "class" && ts.isClassDeclaration(node) && node.name) {
			const classSymbol = checker.getSymbolAtLocation(node.name);
			if (classSymbol) {
				return stripProjectRoot(
					collapseWhitespace(printClassSignature(getClassMemberList(checker, node, classSymbol))),
					projectDir,
				);
			}
		}

		const nameNode = getNameNode(node, block.name);
		const symbol = checker.getSymbolAtLocation(nameNode);
		if (symbol) {
			return stripProjectRoot(collapseWhitespace(printSignatureOfSymbol(checker, symbol, nameNode)), projectDir);
		}
	} catch {
		// Checker calls can throw on synthesized/placeholder nodes (e.g. an unresolved
		// local-reexport with no real declaration) — fall through to the source-text fallback.
	}

	return collapseWhitespace(block.getText());
}
