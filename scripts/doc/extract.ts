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
		.rule("File", many(choice(ref("ExportClause"), ref("Declaration"), anyToken())))
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

	const reexported = new Set<string>()
	root.walk((astNode) => {
		if (astNode.kind !== "ExportClause") return
		for (const nameNode of astNode.fieldList("name")) reexported.add(nameNode.text)
		return false
	})

	const declarations: TDeclaration[] = []
	root.walk((astNode) => {
		if (astNode.kind !== "Declaration") return
		const kindNode = astNode.field("kind")
		const nameNode = astNode.field("name")
		if (!kindNode || !nameNode) return
		const docNode = astNode.field("doc")
		const inlineExport = astNode.fieldList("modifier").some((m) => m.text === "export")
		declarations.push({
			name: nameNode.text,
			kind: kindNode.text,
			exported: inlineExport || reexported.has(nameNode.text),
			line: lineAt(source, kindNode.start),
			doc: docNode ? parseJsDoc(docNode.text) : undefined,
		})
		return false
	})

	return { path: relativePath, declarations }
}

/** Coleta todo `src/**​/*.ts` relevante (sem `.test.ts`, `index.ts`, nem diretórios dot-prefixados). */
function walkSourceFiles(srcDir: string): string[] {
	return fs.readdirSync(srcDir, { recursive: true, withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
		.map((entry) => path.join(entry.parentPath, entry.name))
		.filter((file) => !file.endsWith(".test.ts"))
		.filter((file) => path.basename(file) !== "index.ts")
		.filter((file) => !/(^|[\\/])\./.test(path.relative(srcDir, file)))
		.sort()
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
