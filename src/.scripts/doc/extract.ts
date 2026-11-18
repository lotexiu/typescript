import { TypescriptLang } from "@ts/language/declarations/programing/typescript/declarations"
import { Language } from "@ts/language/model"
import { AstNode } from "@ts/language/node/model"
import fs from "fs"
import path from "path"
import { DOC_REGEX } from "./declarations"
import { JsDocUtils } from "./jsdoc"
import { SignatureUtils, TLineAt } from "./signature"
import { TDeclaration, TDoc, TDocTag, TFileDoc, TGlobalAugmentation, TMember } from "./types"

const LANGUAGE = Language.define(TypescriptLang)

const COMMENT_KINDS: ReadonlySet<string> = new Set(["blockComment", "lineComment", "jsdoc"])

function collectBindingNames(node: AstNode): AstNode[] {
	if (node.kind === "ObjectPattern") {
		return node.children.flatMap((property) => {
			const target = property.field("target") ?? property.field("name")
			return target === undefined ? [] : collectBindingNames(target)
		})
	}
	if (node.kind === "ArrayPattern") {
		return node.children.flatMap((element) => {
			const target = element.field("target")
			return target === undefined ? [] : collectBindingNames(target)
		})
	}
	return [node]
}

function unwrapObject(node: AstNode | undefined): AstNode | undefined {
	if (node === undefined) return undefined
	if (node.kind === "ObjectExpr") return node
	if (node.kind === "AsExpr" || node.kind === "SatisfiesExpr") return unwrapObject(node.field("expr"))
	return undefined
}

function objectConstantMembers(object: AstNode | undefined, lineAt: TLineAt): TMember[] {
	if (object === undefined) return []
	return object.children.flatMap((property): TMember[] => {
		const name = property.field("name")?.text
		const value = property.field("value")
		if (name === undefined || value === undefined || property.kind !== "Property") return []
		return [{ name, kind: "property", signature: SignatureUtils.format(`${name}: ${value.text}`), isStatic: true, line: lineAt(property.start) }]
	})
}

function typeAliasShape(node: AstNode, source: string, lineAt: TLineAt): { signature: string; members: TMember[] } {
	const type = node.field("type")
	const kind = node.field("kind")!
	if (type?.kind !== "ObjectType") return { signature: SignatureUtils.declaration(node, source), members: [] }
	const members = SignatureUtils.typeMembers(type.children, source, lineAt)
	return { signature: SignatureUtils.format(`${source.slice(kind.start, type.start)}{ … }`), members }
}

function describeDeclaration(node: AstNode, source: string, lineAt: TLineAt, reexported: ReadonlySet<string>): TDeclaration[] {
	const kindNode = node.field("kind")
	if (kindNode === undefined) return []
	const kind = kindNode.text
	const doc = SignatureUtils.doc(node)
	const inlineExport = node.fieldList("modifier").some((modifier) => modifier.text === "export")
	const line = lineAt(kindNode.start)
	const common = (name: string) => ({ name, kind, exported: inlineExport || reexported.has(name), internal: JsDocUtils.isInternal(doc), line, doc })
	const declarators = node.fieldList("declarators")
	if (declarators.length > 0) {
		return declarators.flatMap((declarator) =>
			collectBindingNames(declarator.field("name")!).map((nameNode) => ({
				...common(nameNode.text),
				signature: SignatureUtils.variable(kind, declarator, nameNode.text),
				members: nameNode === declarator.field("name") ? objectConstantMembers(unwrapObject(declarator.field("init")), lineAt) : [],
			}))
		)
	}
	const name = node.field("name")?.text
	if (name === undefined) return []
	switch (kind) {
		case "class":
			return [{ ...common(name), signature: SignatureUtils.declaration(node, source), members: SignatureUtils.classMembers(node.field("body"), source, lineAt) }]
		case "interface":
			return [{ ...common(name), signature: SignatureUtils.declaration(node, source), members: SignatureUtils.typeMembers(node.fieldList("body"), source, lineAt) }]
		case "type":
			return [{ ...common(name), ...typeAliasShape(node, source, lineAt) }]
		case "enum":
			return [{ ...common(name), signature: SignatureUtils.declaration(node, source), members: SignatureUtils.enumMembers(node, source, lineAt) }]
		default:
			return [{ ...common(name), signature: SignatureUtils.declaration(node, source), members: [] }]
	}
}

function describeGlobals(node: AstNode, source: string, lineAt: TLineAt): TGlobalAugmentation[] {
	const target = node.field("target")?.text ?? "global"
	return node
		.fieldList("body")
		.filter((declaration) => declaration.field("kind")?.text === "interface")
		.map((declaration) => ({
			target,
			name: declaration.field("name")!.text,
			line: lineAt(declaration.start),
			members: SignatureUtils.typeMembers(declaration.fieldList("body"), source, lineAt),
		}))
}

function extractSource(source: string, relativePath: string): TFileDoc {
	const { root, diagnostics, tokens } = LANGUAGE.analyze(source, relativePath)
	const lineAt = (offset: number) => root.lineAt(offset)

	const sideEffect =
		root.nodes.some((node) => node.kind === "SideEffect") ||
		tokens.some((token) => COMMENT_KINDS.has(token.kind) && token.value.includes("@required"))

	const exportOrder: string[] = []
	const reexported = new Set<string>()
	root.walk((node) => {
		if (node.kind !== "ExportClause") return
		for (const nameNode of node.fieldList("name")) {
			if (!reexported.has(nameNode.text)) exportOrder.push(nameNode.text)
			reexported.add(nameNode.text)
		}
		return false
	})

	const declarations: TDeclaration[] = []
	const globals: TGlobalAugmentation[] = []
	root.walk((node) => {
		if (node.kind === "SideEffect") {
			globals.push(...describeGlobals(node, source, lineAt))
			return false
		}
		if (node.kind !== "Declaration") return
		declarations.push(...describeDeclaration(node, source, lineAt, reexported))
		return false
	})

	return { path: relativePath, declarations: mergeOverloads(declarations), globals, sideEffect, exportOrder, diagnostics }
}

/**
 * Junta as sobrecargas de uma função numa declaração só: as assinaturas declaradas (sem a de implementação, como o
 * TypeScript mostra para quem chama) e o primeiro JSDoc encontrado.
 */
function mergeOverloads(declarations: readonly TDeclaration[]): TDeclaration[] {
	const merged: TDeclaration[] = []
	for (const declaration of declarations) {
		const previous = merged[merged.length - 1]
		if (previous === undefined || declaration.kind !== "function" || previous.kind !== "function" || previous.name !== declaration.name) {
			merged.push({ ...declaration, overloads: [declaration.signature] })
			continue
		}
		merged[merged.length - 1] = {
			...previous,
			exported: previous.exported || declaration.exported,
			doc: previous.doc ?? declaration.doc,
			internal: previous.internal || declaration.internal,
			overloads: [...(previous.overloads ?? []), declaration.signature],
		}
	}
	return merged.map((declaration) => {
		const overloads = declaration.overloads ?? []
		if (overloads.length < 2) return { ...declaration, overloads: undefined }
		const visible = overloads.slice(0, -1)
		return { ...declaration, signature: visible.join("\n"), overloads: visible }
	})
}

function extractFile(absolutePath: string, relativePath: string): TFileDoc {
	return extractSource(fs.readFileSync(absolutePath, "utf-8"), relativePath)
}

function walkSourceFiles(sourceDirectory: string): string[] {
	const skipDirectory = (name: string) => name.startsWith(".") || name === "node_modules"
	const found: string[] = []
	const walk = (directory: string) => {
		const entries = fs.readdirSync(directory, { withFileTypes: true })
		const files = entries
			.filter((entry) => entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts") && entry.name !== "index.ts")
			.map((entry) => entry.name)
			.sort()
		const directories = entries.filter((entry) => entry.isDirectory() && !skipDirectory(entry.name)).map((entry) => entry.name).sort()
		for (const file of files) found.push(path.join(directory, file))
		for (const child of directories) walk(path.join(directory, child))
	}
	walk(sourceDirectory)
	return found
}

function toPosixPath(filePath: string): string {
	return filePath.replace(DOC_REGEX.BACKSLASH, "/")
}

const parseJsDoc = JsDocUtils.parse

export type { TDoc, TDocTag, TDeclaration, TFileDoc }
export { extractFile, extractSource, walkSourceFiles, parseJsDoc, toPosixPath }
