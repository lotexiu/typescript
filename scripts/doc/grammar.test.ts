import { describe, expect, it } from "vitest"
import { AstRoot } from "../../src/ast/node/model"
import { TToken } from "../../src/lexer/types"
import { TGrammarCtx, TMatcher } from "../../src/ast/grammar/types"
import { Grammar } from "../../src/ast/grammar/model"
import { GrammarUtils } from "../../src/ast/grammar/utils"

const { anyToken, choice, field, kindVal, many, node, notAhead, opt, ref, seq, tok, val } = GrammarUtils

/** Monta um stream de tokens fake — `value` vira também o `kind` quando não há `:`. */
function toks(...specs: string[]): TToken[] {
	let offset = 0
	return specs.map((spec) => {
		const [kind, value = kind] = spec.includes(":") ? spec.split(":") : [spec, spec]
		const token = { kind, value, start: offset, end: offset + value.length }
		offset += value.length + 1
		return token
	})
}

function run(matcher: TMatcher, tokens: TToken[]) {
	const ctx: TGrammarCtx = { tokens, root: new AstRoot(""), grammar: new Grammar(), memo: new Map(), furthest: 0 }
	return matcher(ctx, 0)
}

describe("combinadores", () => {
	it("seq casa em ordem e falha se um item falha", () => {
		expect(run(seq(tok("a"), tok("b")), toks("a", "b")).ok).toBe(true)
		expect(run(seq(tok("a"), tok("b")), toks("a", "c")).ok).toBe(false)
	})

	it("choice devolve o primeiro que casa (ordenado)", () => {
		const m = choice(tok("a"), tok("b"))
		expect(run(m, toks("b")).ok).toBe(true)
		expect(run(m, toks("c")).ok).toBe(false)
	})

	it("many é greedy e nunca falha; opt idem", () => {
		const r = run(many(tok("a")), toks("a", "a", "a", "b"))
		expect(r.ok && r.next).toBe(3)
		expect(run(opt(tok("x")), toks("y")).ok).toBe(true)
	})

	it("notAhead é largura zero", () => {
		const r = run(seq(notAhead(tok("b")), tok("a")), toks("a"))
		expect(r.ok && r.next).toBe(1)
		expect(run(seq(notAhead(tok("a")), tok("a")), toks("a")).ok).toBe(false)
	})

	it("val casa por valor independente do kind", () => {
		expect(run(val("export"), toks("keyword:export")).ok).toBe(true)
	})
})

describe("node / field", () => {
	const g = new Grammar()
		.rule("Pair", node("Pair", seq(
			field("k", tok("id")),
			kindVal("punct", "="),
			field("v", tok("num")),
		)))
		.rule("File", many(choice(ref("Pair"), anyToken())))
		.start("File")

	it("constrói nó com campos nomeados e span cobrindo os filhos", () => {
		const root = g.parse(toks("id:x", "punct:=", "num:1"), "x = 1")
		expect(root.children).toHaveLength(1)
		const pair = root.children[0]
		expect(pair.kind).toBe("Pair")
		expect(pair.field("k")?.text).toBe("x")
		expect(pair.field("v")?.text).toBe("1")
		expect([pair.start, pair.end]).toEqual([0, 5])
	})

	it("pula tokens não reconhecidos e continua (recuperação por anyToken)", () => {
		const root = g.parse(toks("junk", "id:a", "punct:=", "num:2", "junk"), "")
		expect(root.children.map((n) => n.field("k")?.text)).toEqual(["a"])
	})

	it("memoiza regra nomeada por posição", () => {
		const root = g.parse(toks("id:a", "punct:=", "num:1"), "a = 1")
		expect(root.nodes.some((n) => n.kind === "Pair")).toBe(true)
	})
})
