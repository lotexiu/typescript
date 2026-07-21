import { Language } from "@ts/language/model"
import { G } from "@ts/language/grammar"
import type { TLanguageSpec } from "@ts/language/types"
import { AstNode, AstRoot } from "@ts/language/node/model";

console.clear()

// ---- predicados de char (protótipo — códigos crus, sem Unicode estendido) ----
const isSpace = (c: number) => c === 32 || c === 9 || c === 13 || c === 10
const isDigit = (c: number) => c >= 48 && c <= 57
const isIdStart = (c: number) => (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 95 || c === 36
const isIdPart = (c: number) => isIdStart(c) || isDigit(c)

// ---- a linguagem inteira num objeto: escopos, opacos, classes de char, literais, gramática ----
const spec: TLanguageSpec = {
	scope: {
		block: ["{", "}"],
		paren: ["(", ")"],
		bracket: ["[", "]"],
	},
	delimited: {
		lineComment: { open: "//", close: "\n", consumeClose: false, trivia: true },
		blockComment: { open: "/*", close: "*/", trivia: true },
		string: [{ open: '"', close: '"' }, { open: "'", close: "'" }],
	},
	charClass: {
		space: { start: isSpace, trivia: true },
		identifier: { start: isIdStart, continue: isIdPart },
		number: { start: isDigit, continue: isDigit },
	},
	literal: {
		keyword: ["const", "let", "var", "function", "return"],
		operator: ["=>", "===", "==", "=", "+", "-", "*", "/", "<", ">"],
		punct: [",", ".", ";", ":"],
	},
	grammar: {
		program: G.many(G.choice(G.ref("statement"), G.skip())),
		statement: G.choice(G.ref("funcDecl"), G.ref("varDecl")),

		varDecl: G.node("VarDecl", G.seq(
			G.field("kw", G.tok("keyword")),
			G.field("name", G.tok("identifier")),
			G.val("="),
			G.field("init", G.ref("expr")),
			G.opt(G.val(";")),
		)),

		funcDecl: G.node("FuncDecl", G.seq(
			G.val("function"),
			G.field("name", G.tok("identifier")),
			G.field("params", G.into("paren", "paramList")),  // desce no escopo (...)
			G.field("body", G.placeholder("block")),          // NÃO desce em {...} — fica folha
		)),

		paramList: G.node("Params", G.sepBy(G.field("param", G.tok("identifier")), G.val(","))),
		expr: G.choice(G.tok("number"), G.tok("identifier"), G.tok("string")),
	},
	start: "program",
}

const source = `const x = 1
// declara uma função
function foo(a, b) {
	return a + b
}
let s = "hi"`

const lang = Language.define(spec)
const tree: AstRoot = lang.parse(source)

// ---- impressão da árvore ----
function print(node: AstNode, indent: string): void {
	const fields = [...node.fields.keys()]
	const head = `${indent}${node.kind}`
	const detail = node.children.length === 0 ? `  ${JSON.stringify(node.text)}` : fields.length ? `  {${fields.join(", ")}}` : ""
	console.log(head + detail)
	for (const child of node.children) print(child, indent + "  ")
}

for (const child of tree.children) print(child, "")

console.log("\n--- checagem ---")
const func = tree.children.find((n) => n.kind === "FuncDecl")!
const body = func.field("body")!
console.log("body.kind      =", body.kind)
console.log("body.children  =", body.children.length, "(0 = corpo não processado)")
console.log("body.text      =", JSON.stringify(body.text))
console.log("params         =", func.field("params")?.fieldList("param").map((p) => p.text))
