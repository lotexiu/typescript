/**
 * Exemplo mínimo de uso de `src/ast` — `Grammar` + `GrammarUtils` + `AstNode`/`AstRoot`.
 *
 *   pnpm ast:example        (ou:  npx tsx scripts/ast-example.ts)
 *
 * NÃO tem nada de TypeScript nem de extração de doc aqui — é o "hello world" do motor,
 * sem o ruído de `extract.ts` / `lang-ts.ts`. A ideia é: ler este arquivo de cima a
 * baixo e entender as 3 peças.
 *
 * As 3 peças:
 *   1. Lexer   — texto  → lista plana de tokens `{ kind, start, end, value }`
 *   2. Grammar — tokens → árvore de `AstNode` (via regras montadas com combinadores)
 *   3. AstNode — o nó: `kind`, `text`, `children`, `fields` (filhos nomeados), `walk`
 */

import { Grammar } from "../src/ast/grammar/model"
import { GrammarUtils } from "../src/ast/grammar/utils"
import { AstNode, AstRoot } from "../src/ast/node/model"
import { Lexer } from "../src/lexer/model"
import { TToken } from "../src/lexer/types"

// `GrammarUtils` é uma classe só de estáticos. Desestruture o que for usar — os
// combinadores não usam `this`, então funcionam soltos.
const { seq, choice, many, opt, tok, val, field, node, ref } = GrammarUtils

// ───────────────────────────────────────────────────────────────────────────────
// PARTE 1 — Grammar sozinha, sobre tokens montados à mão
// ───────────────────────────────────────────────────────────────────────────────
//
// Vamos reconhecer um mini formato de config:  chave: valor, chave: valor
// Ex.:  name: "Ana", age: 30
//
// Primeiro, sem Lexer nenhum: um array de tokens escrito na mão, só pra ver a Grammar
// operando. Um token é `{ kind, value, start, end }` — `start`/`end` são offsets no
// texto-fonte (usados pra `node.text` e pra localizar erros).

function fakeTokens(...pairs: [kind: string, value: string][]): { tokens: TToken[]; source: string } {
	let offset = 0
	let source = ""
	const tokens = pairs.map(([kind, value]) => {
		const t = { kind, value, start: offset, end: offset + value.length }
		source += value
		offset += value.length
		return t
	})
	return { tokens, source }
}

const hand = fakeTokens(
	["ident", "name"], ["punct", ":"], ["string", "Ana"], ["punct", ","],
	["ident", "age"], ["punct", ":"], ["number", "30"],
)

// A gramática. Leia de dentro pra fora:
//
//   node("Pair", seq(...))     cria 1 AstNode de kind "Pair" com o que `seq` casar
//     field("key",   tok("ident"))     casa 1 token "ident"  e guarda como campo `key`
//     val(":")                         casa o token de valor ":" (descartado)
//     field("value", choice(...))      casa string OU number e guarda como campo `value`
//
//   many(seq(ref("Pair"), opt(val(",")))))   repete Pair, vírgula opcional entre eles
//
const grammar = new Grammar()
	.rule("Pair", node("Pair", seq(
		field("key", tok("ident")),
		val(":"),
		field("value", choice(tok("string"), tok("number"))),
	)))
	.rule("Config", many(seq(ref("Pair"), opt(val(",")))))
	.start("Config")

const root1: AstRoot = grammar.parse(hand.tokens, hand.source)

console.log("── Parte 1: tokens à mão ──")
console.log("nós de topo:", root1.children.map((n) => n.kind)) // [ 'Pair', 'Pair' ]
for (const pair of root1.children) {
	// `.field(name)` → primeiro filho daquele campo (ou undefined).  `.text` → a fatia
	// da fonte que o nó cobre (lazy: só corta a string no 1º acesso).
	const key = pair.field("key")!.text
	const value = pair.field("value")!.text
	console.log(`  ${key} = ${value}   (${pair.field("value")!.kind})`)
}

// ───────────────────────────────────────────────────────────────────────────────
// PARTE 2 — mesma gramática, agora com um Lexer de verdade (texto → tokens)
// ───────────────────────────────────────────────────────────────────────────────
//
// O Lexer recebe regras de token. 3 tipos:
//   - delimited : conteúdo entre `open` e `close` vira 1 token (strings, comentários)
//   - charClass : um "run" de chars que passam num predicado `(code:number)=>boolean`
//   - literal   : lista de strings exatas (pontuação, keywords)

const lexer = new Lexer()
lexer.addRules(
	{ kind: "string", type: "delimited", open: '"', close: '"' },
	{ kind: "ident", type: "charClass", test: (c) => (c >= 65 && c <= 90) || (c >= 97 && c <= 122) },
	{ kind: "number", type: "charClass", test: (c) => c >= 48 && c <= 57 },
	{ kind: "punct", type: "literal", values: [":", ","] },
	{ kind: "space", type: "charClass", test: (c) => c === 32 || c === 10 || c === 9 },
)

const sourceText = `name: "Ana", age: 30, city: "Lisboa"`
lexer.text.set(sourceText)

// `lexer.tokens` é o array plano. Filtramos "space" — a Grammar não tem noção de trivia
// (candidato a melhoria: Lexer/Grammar poderem marcar kinds a ignorar).
const tokens = lexer.tokens.filter((t) => t.kind !== "space")

const root2 = grammar.parse(tokens, sourceText)

console.log("\n── Parte 2: via Lexer ──")
for (const pair of root2.children) {
	console.log(`  ${pair.field("key")!.text} = ${pair.field("value")!.text}`)
}

// ───────────────────────────────────────────────────────────────────────────────
// PARTE 3 — navegar a árvore
// ───────────────────────────────────────────────────────────────────────────────

console.log("\n── Parte 3: navegação ──")

const firstPair = root2.children[0]
console.log("firstPair.text      :", JSON.stringify(firstPair.text)) // 'name: "Ana"'
console.log("firstPair.start/end :", firstPair.start, firstPair.end)
console.log("firstPair.children  :", firstPair.children.map((c) => `${c.kind}:${c.text}`))
console.log("firstPair.child()   :", firstPair.child("string")?.text) // acha o 1º filho de um kind

// `walk` percorre em pré-ordem; retornar `false` poda a subárvore.
const kinds: string[] = []
root2.walk((n) => { kinds.push(n.kind) })
console.log("walk (todos kinds)  :", kinds.join(" "))

// Nº da linha de um nó — hoje é manual (candidato a helper `node.line` ou `root.lineAt`).
function lineAt(source: string, offset: number): number {
	let line = 1
	for (let i = 0; i < offset; i++) if (source.charCodeAt(i) === 10) line++
	return line
}
console.log("linha do 1º Pair    :", lineAt(sourceText, firstPair.start))

// ───────────────────────────────────────────────────────────────────────────────
// PARTE 4 — recursão (ref) + fields repetidos (fieldList)
// ───────────────────────────────────────────────────────────────────────────────
//
// Uma lista aninhada de números:  [ 1, [ 2, 3 ], 4 ]

const listLexer = new Lexer()
listLexer.addRules(
	{ kind: "number", type: "charClass", test: (c) => c >= 48 && c <= 57 },
	{ kind: "punct", type: "literal", values: ["[", "]", ","] },
	{ kind: "space", type: "charClass", test: (c) => c === 32 },
)
listLexer.text.set(`[1, [2, 3], 4]`)

const listGrammar = new Grammar()
	.rule("List", node("List", seq(
		val("["),
		opt(seq(
			field("item", ref("Value")),
			many(seq(val(","), field("item", ref("Value")))),
		)),
		val("]"),
	)))
	.rule("Value", choice(tok("number"), ref("List")))
	.start("List")

const listRoot = listGrammar.parse(
	listLexer.tokens.filter((t) => t.kind !== "space"),
	listLexer.text.value,
)

console.log("\n── Parte 4: recursão ──")
function describe(n: AstNode): string {
	if (n.kind === "number") return n.text
	// `fieldList` → todos os filhos daquele campo (aqui, cada item da lista)
	return "[" + n.fieldList("item").map(describe).join(", ") + "]"
}
console.log("  reconstruído:", describe(listRoot.children[0]))
