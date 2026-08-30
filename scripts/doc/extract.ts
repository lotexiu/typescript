import fs from "fs"
import path from "path"
import { Lexer } from "../../src/lexer/model"
import { Grammar } from "../../src/ast/grammar/model"
import { GrammarUtils } from "../../src/ast/grammar/utils"
import { TGrammarCtx, TMatchResult } from "../../src/ast/grammar/types"
import { tsTokenRules } from "./lang-ts"

const { anyToken, choice, field, kindVal, many, node, notAhead, opt, ref, seq, tok } = GrammarUtils

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
	 * Arquivo com efeito colateral no import: tem um bloco `declare global`/`declare module`
	 * ou um comentário `@required`. O gerador de index emite `import './arquivo'` para ele em
	 * vez de re-exportar símbolos.
	 */
	sideEffect: boolean
	/** Nomes na ordem em que aparecem nas cláusulas `export { … }` do arquivo (document order). */
	exportOrder: string[]
}

const DECL_KEYWORDS = new Set([
	"export", "declare", "abstract", "default",
	"class", "interface", "type", "function", "const", "let", "var", "enum", "namespace",
])

const OPENERS = new Set(["(", "[", "{"])
const CLOSERS = new Set([")", "]", "}"])

/**
 * Consome tudo que pertence à declaração depois do nome: pula grupos `()[]{}` balanceados
 * (corpos de classe/função, tipos de objeto) e para no `;` de nível 0 ou logo antes da
 * próxima keyword que inicia declaração. Não produz capturas — o corpo não é representado.
 */
const declarationTail = (ctx: TGrammarCtx, pos: number): TMatchResult => {
	let depth = 0
	let i = pos
	while (i < ctx.tokens.length) {
		const token = ctx.tokens[i]
		if (token.kind === "punctuation") {
			if (OPENERS.has(token.value)) depth++
			else if (CLOSERS.has(token.value)) { if (depth > 0) depth-- }
			else if (token.value === ";" && depth === 0) return { ok: true, next: i + 1, captures: [] }
		} else if (depth === 0 && token.kind === "jsdoc" && i > pos) {
			// Um JSDoc de nível 0 depois da declaração pertence à próxima — não engolir.
			return { ok: true, next: i, captures: [] }
		} else if (
			depth === 0 && token.kind === "keyword" && DECL_KEYWORDS.has(token.value) &&
			// Só para se a keyword abre uma linha nova — evita cortar em `as const`, `x satisfies type`, etc.
			i > pos && ctx.root.source.slice(ctx.tokens[i - 1].end, token.start).includes("\n")
		) {
			return { ok: true, next: i, captures: [] }
		}
		i++
	}
	return { ok: true, next: i, captures: [] }
}

/**
 * Casa um bloco de augmentation ambiente — `declare global { … }` ou
 * `declare module "x" { … }` — e consome o corpo `{ … }` balanceado inteiro sem produzir
 * capturas. Serve para (1) marcar que o arquivo tem efeito colateral (precisa de
 * `import './arquivo'` no index) e (2) impedir que as declarações internas
 * (`interface String { … }` dentro de `declare global`) vazem como se fossem declarações
 * top-level do arquivo.
 */
const sideEffectBlock = (ctx: TGrammarCtx, pos: number): TMatchResult => {
	const tokens = ctx.tokens
	let i = pos
	if (!(tokens[i]?.kind === "keyword" && tokens[i].value === "declare")) return { ok: false }
	i++

	const head = tokens[i]
	if (!head || head.kind !== "identifier" || (head.value !== "global" && head.value !== "module")) {
		return { ok: false }
	}
	i++

	if (head.value === "module") {
		if (tokens[i]?.kind !== "string") return { ok: false }
		i++
	}

	if (!(tokens[i]?.kind === "punctuation" && tokens[i].value === "{")) return { ok: false }

	let depth = 0
	while (i < tokens.length) {
		const token = tokens[i]
		if (token.kind === "punctuation" && token.value === "{") depth++
		else if (token.kind === "punctuation" && token.value === "}") {
			depth--
			if (depth === 0) return { ok: true, next: i + 1, captures: [] }
		}
		i++
	}
	return { ok: true, next: i, captures: [] }
}

function buildGrammar(): Grammar {
	const kw = (value: string) => kindVal("keyword", value)
	const punct = (value: string) => kindVal("punctuation", value)
	const modifier = field("modifier", choice(kw("export"), kw("default"), kw("declare"), kw("abstract")))
	const kind = field("kind", choice(
		kw("class"), kw("interface"), kw("type"), kw("function"), kw("const"), kw("let"), kw("var"), kw("enum"),
	))

	// `export { a, b as c, type d } ...` — nomes locais reexportados no fim do arquivo.
	const exportEntry = seq(
		opt(kw("type")),
		field("name", tok("identifier")),
		opt(seq(kindVal("identifier", "as"), tok("identifier"))),
		opt(punct(",")),
	)

	return new Grammar()
		.rule("SideEffect", node("SideEffect", sideEffectBlock))
		.rule("ExportClause", node("ExportClause", seq(
			kw("export"),
			opt(kw("type")),
			punct("{"),
			many(seq(notAhead(punct("}")), exportEntry)),
			punct("}"),
		)))
		.rule("Declaration", node("Declaration", seq(
			opt(field("doc", tok("jsdoc"))),
			many(modifier),
			kind,
			field("name", tok("identifier")),
			declarationTail,
		)))
		// `const { a, b, c: d } = X` — cada nome ligado vira uma declaração `const` (padrão
		// usado por `implementations.ts` que desestrutura de um `_Foo` interno e re-exporta).
		.rule("Destructure", node("Destructure", seq(
			opt(field("doc", tok("jsdoc"))),
			many(modifier),
			field("kind", choice(kw("const"), kw("let"), kw("var"))),
			punct("{"),
			many(seq(
				notAhead(punct("}")),
				choice(
					seq(tok("identifier"), punct(":"), field("name", tok("identifier"))),
					field("name", tok("identifier")),
				),
				opt(punct(",")),
			)),
			punct("}"),
			declarationTail,
		)))
		.rule("File", many(choice(ref("SideEffect"), ref("ExportClause"), ref("Destructure"), ref("Declaration"), anyToken())))
		.start("File")
}

const GRAMMAR = buildGrammar()

/** `/** ... *​/` → descrição + tags. */
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

function lineAt(source: string, offset: number): number {
	let line = 1
	for (let i = 0; i < offset && i < source.length; i++) if (source.charCodeAt(i) === 10) line++
	return line
}

/** Lê e extrai as declarações top-level de um arquivo `.ts`. */
function extractFile(absolutePath: string, relativePath: string): TFileDoc {
	return extractSource(fs.readFileSync(absolutePath, "utf-8"), relativePath)
}

/** Extrai as declarações top-level de uma string de fonte TS. */
function extractSource(source: string, relativePath: string): TFileDoc {
	const lexer = new Lexer()
	lexer.escape = "\\"
	lexer.addRules(...tsTokenRules())
	lexer.text.set(source)

	const root = GRAMMAR.parse(lexer.tokens, source, lexer.triviaKinds)

	const sideEffect =
		root.nodes.some((astNode) => astNode.kind === "SideEffect") ||
		lexer.tokens.some(
			(token) =>
				(token.kind === "comment" || token.kind === "lineComment" || token.kind === "jsdoc") &&
				token.value.includes("@required"),
		)

	const exportOrder: string[] = []
	const reexported = new Set<string>()
	root.walk((astNode) => {
		if (astNode.kind !== "ExportClause") return
		for (const nameNode of astNode.fieldList("name")) {
			if (!reexported.has(nameNode.text)) exportOrder.push(nameNode.text)
			reexported.add(nameNode.text)
		}
		return false
	})

	const declarations: TDeclaration[] = []
	root.walk((astNode) => {
		if (astNode.kind !== "Declaration" && astNode.kind !== "Destructure") return
		const kindNode = astNode.field("kind")
		const nameNodes = astNode.fieldList("name")
		if (!kindNode || nameNodes.length === 0) return
		const docNode = astNode.field("doc")
		const inlineExport = astNode.fieldList("modifier").some((m) => m.text === "export")
		const doc = docNode ? parseJsDoc(docNode.text) : undefined
		const line = lineAt(source, kindNode.start)
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

	return { path: relativePath, declarations, sideEffect, exportOrder }
}

/**
 * Coleta todo `src/**​/*.ts` relevante (sem `.test.ts`, `index.ts`, nem diretórios
 * dot-prefixados). Ordem: em cada diretório, arquivos antes de subdiretórios, ambos em
 * ordem alfabética, descendo em profundidade — a mesma ordem que o `ts.sys.readDirectory`
 * produz, para o `src/index.ts` gerado sair estável e igual ao histórico.
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
	GRAMMAR,
}
