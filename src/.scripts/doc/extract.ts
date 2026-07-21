import { TypescriptLang } from "@ts/language/declarations/programing/typescript/declarations";
import { Language } from "@ts/language/model";
import { AstNode } from "@ts/language/node/model";
import { TDiagnostic } from "@ts/language/types";
import fs from "fs"
import path from "path"


/** JSDoc já normalizado: descrição livre + tags `@nome valor`. */
type TDocTag = { name: string; value?: string }
type TDoc = { description: string; tags: TDocTag[] }

/** Uma declaração top-level encontrada num arquivo. */
type TDeclaration = {
	name: string
	/** Keyword que a introduz: `class` | `interface` | `type` | `function` | `const` | `let` | `var` | `enum`. */
	kind: string
	exported: boolean
	/** Linha 1-indexada da keyword `kind`. */
	line: number
	doc?: TDoc
}

type TFileDoc = {
	path: string
	declarations: TDeclaration[]
	/**
	 * Arquivo com efeito colateral no import: bloco `declare global`/`declare module` ou um
	 * comentário `@required`. O gerador de index emite `import './arquivo'` em vez de
	 * re-exportar símbolos.
	 */
	sideEffect: boolean
	/** Nomes na ordem em que aparecem nas cláusulas `export { … }` (document order). */
	exportOrder: string[]
	diagnostics: TDiagnostic[]
}

const LANG = Language.define(TypescriptLang)

/**
 * Nome(s) de binding realmente declarados por um `BindingName` — pode ser 1 identificador
 * direto ou, recursivamente, os nomes dentro de um `ObjectPattern`/`ArrayPattern`
 * (`const { a, b: { c } } = x` → `a`, `c`). Espelha a forma que `grammar-shared.ts` usa pra
 * montar esses nós (`BindingProperty.target` ou `.name` no shorthand; `ArrayPatternElement.target`).
 */
function collectBindingNames(node: AstNode): AstNode[] {
	if (node.kind === "ObjectPattern") {
		return node.children.flatMap((property) => collectBindingNames(property.field("target") ?? property.field("name")!))
	}
	if (node.kind === "ArrayPattern") {
		return node.children.flatMap((element) => collectBindingNames(element.field("target")!))
	}
	return [node]
}

/** `/** … *​/` → descrição + tags. */
function parseJsDoc(raw: string): TDoc {
	const body = raw.replace(/^\/\*\*/, "").replace(/\*\/$/, "")
	const lines = body.split("\n").map((line) => line.replace(/^\s*\*?\s?/, "").trimEnd())

	const description: string[] = []
	const tags: TDocTag[] = []
	for (const line of lines) {
		const tag = /^@(\S+)\s*(.*)$/.exec(line)
		if (tag) tags.push({ name: tag[1], value: tag[2] || undefined })
		else if (tags.length === 0) description.push(line)
	}
	return { description: description.join("\n").trim(), tags }
}

/** Lê e extrai as declarações top-level de um arquivo `.ts`. */
function extractFile(absolutePath: string, relativePath: string): TFileDoc {
	return extractSource(fs.readFileSync(absolutePath, "utf-8"), relativePath)
}

/** Extrai as declarações top-level de uma string de fonte TS. */
function extractSource(source: string, relativePath: string): TFileDoc {
	const { root, diagnostics, tokens } = LANG.analyze(source, relativePath)

	const sideEffect =
		root.nodes.some((node) => node.kind === "SideEffect") ||
		tokens.some(
			(token) =>
				(token.kind === "blockComment" || token.kind === "lineComment" || token.kind === "jsdoc") &&
				token.value.includes("@required"),
		)

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
	root.walk((node) => {
		if (node.kind !== "Declaration") return
		const kindNode = node.field("kind")
		const declarators = node.fieldList("declarators")
		const nameNodes = declarators.length
			? declarators.flatMap((declarator) => collectBindingNames(declarator.field("name")!))
			: node.fieldList("name")
		if (!kindNode || nameNodes.length === 0) return
		const docNode = node.field("doc")
		const inlineExport = node.fieldList("modifier").some((modifier) => modifier.text === "export")
		const doc = docNode ? parseJsDoc(docNode.text) : undefined
		const line = root.lineAt(kindNode.start)
		for (const nameNode of nameNodes) {
			declarations.push({
				name: nameNode.text,
				kind: kindNode.text,
				exported: inlineExport || reexported.has(nameNode.text),
				line,
				doc,
			})
		}
		return false
	})

	return { path: relativePath, declarations, sideEffect, exportOrder, diagnostics }
}

/**
 * Coleta todo `src/**​/*.ts` relevante (sem `.test.ts`, `index.ts`, nem diretórios
 * dot-prefixados). Ordem: em cada diretório, arquivos antes de subdiretórios, ambos
 * alfabéticos, descendo em profundidade — para o `src/index.ts` gerado sair estável.
 */
function walkSourceFiles(srcDir: string): string[] {
	const skipDir = (name: string) => name.startsWith(".") || name === "node_modules"
	const out: string[] = []

	const walk = (dir: string) => {
		const entries = fs.readdirSync(dir, { withFileTypes: true })
		const files = entries
			.filter((e) => e.isFile() && e.name.endsWith(".ts") && !e.name.endsWith(".test.ts") && e.name !== "index.ts")
			.map((e) => e.name)
			.sort()
		const dirs = entries.filter((e) => e.isDirectory() && !skipDir(e.name)).map((e) => e.name).sort()
		for (const file of files) out.push(path.join(dir, file))
		for (const sub of dirs) walk(path.join(dir, sub))
	}

	walk(srcDir)
	return out
}

export {
	TDoc,
	TDocTag,
	TDeclaration,
	TFileDoc,
	extractFile,
	extractSource,
	walkSourceFiles,
	parseJsDoc,
}
