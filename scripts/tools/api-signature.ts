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
	return node;
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

function printClassSignature(checker: ts.TypeChecker, classNode: ts.ClassDeclaration, classSymbol: ts.Symbol): string {
	const printMember = (memberSymbol: ts.Symbol): string => {
		const type = checker.getTypeOfSymbolAtLocation(memberSymbol, classNode);
		return `${memberSymbol.getName()}: ${checker.typeToString(type, classNode, ts.TypeFormatFlags.NoTruncation)}`;
	};

	const staticMembers = classSymbol.exports ? Array.from(classSymbol.exports.values()) : [];
	const instanceMembers = classSymbol.members ? Array.from(classSymbol.members.values()) : [];

	const staticText = staticMembers.map(printMember).sort().join("; ");
	const instanceText = instanceMembers.map(printMember).sort().join("; ");

	return `static { ${staticText} } instance { ${instanceText} }`;
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
				return stripProjectRoot(collapseWhitespace(printClassSignature(checker, node, classSymbol)), projectDir);
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
