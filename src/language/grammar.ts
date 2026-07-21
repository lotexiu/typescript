import { SCOPE_KIND_PREFIX } from "./declarations"
import { AstNode } from "./node/model";
import type { TLangCapture, TLangCtx, TLangToken, TLangMatch, TRule } from "./types"

/**
 * Combinadores para montar a gramática de uma `TLanguageSpec` — todos `static`, sem estado.
 * Chamadas entre irmãos usam sempre `G.x` (nunca `this`) para sobreviver a destructuring.
 *
 * Diferença para um motor de gramática comum: dois combinadores conhecem a árvore de escopo
 * que o `Parser` já montou — `into` desce num escopo aninhado e o parseia com outra regra;
 * `placeholder` casa o escopo como 1 nó-folha sem descer (ponto de corte para lazy).
 */
class G {
	static readonly #FAIL: TLangMatch = { ok: false }

	static #ok(next: number, captures: TLangCapture[]): TLangMatch {
		return { ok: true, next, captures }
	}

	static #fail(ctx: TLangCtx, pos: number): TLangMatch {
		if (pos > ctx.furthest) ctx.furthest = pos
		return G.#FAIL
	}

	static #leaf(ctx: TLangCtx, token: TLangToken): AstNode {
		const node = new AstNode(token.kind, ctx.root, token.start, token.end, token.value)
		ctx.root.nodes.push(node)
		return node
	}

	/** Casa 1 token de um dado `kind` (família de literal, charClass ou delimited). */
	static tok(kind: string): TRule {
		return (ctx, pos) => {
			const token = ctx.tokens[pos]
			if (!token || token.kind !== kind) return G.#fail(ctx, pos)
			return G.#ok(pos + 1, [{ node: G.#leaf(ctx, token), leaf: true }])
		}
	}

	/** Casa 1 token por `value` literal, de qualquer `kind` (ex: `val("=>")`, `val("const")`). */
	static val(value: string): TRule {
		return (ctx, pos) => {
			const token = ctx.tokens[pos]
			if (!token || token.value !== value) return G.#fail(ctx, pos)
			return G.#ok(pos + 1, [{ node: G.#leaf(ctx, token), leaf: true }])
		}
	}

	/** Sequência: todos em ordem, concatenando capturas. */
	static seq(...rules: TRule[]): TRule {
		return (ctx, pos) => {
			const captures: TLangCapture[] = []
			let cursor = pos
			for (const rule of rules) {
				const result = rule(ctx, cursor)
				if (!result.ok) return G.#FAIL
				captures.push(...result.captures)
				cursor = result.next
			}
			return G.#ok(cursor, captures)
		}
	}

	/** Escolha ordenada (PEG): o primeiro que casa vence. */
	static choice(...rules: TRule[]): TRule {
		return (ctx, pos) => {
			for (const rule of rules) {
				const result = rule(ctx, pos)
				if (result.ok) return result
			}
			return G.#fail(ctx, pos)
		}
	}

	/** Zero ou mais (para no 1º fail ou ao deixar de avançar). */
	static many(rule: TRule): TRule {
		return (ctx, pos) => {
			const captures: TLangCapture[] = []
			let cursor = pos
			for (;;) {
				const result = rule(ctx, cursor)
				if (!result.ok || result.next === cursor) break
				captures.push(...result.captures)
				cursor = result.next
			}
			return G.#ok(cursor, captures)
		}
	}

	/** Opcional — sempre casa; sem capturas quando ausente. */
	static opt(rule: TRule): TRule {
		return (ctx, pos) => {
			const result = rule(ctx, pos)
			return result.ok ? result : G.#ok(pos, [])
		}
	}

	/** `item` separado por `separator` (zero ou mais itens). */
	static sepBy(item: TRule, separator: TRule): TRule {
		return G.opt(G.seq(item, G.many(G.seq(separator, item))))
	}

	/** Consome 1 token qualquer — usado como "pula o que eu não reconheço" no loop de topo. */
	static skip(): TRule {
		return (ctx, pos) => (ctx.tokens[pos] ? G.#ok(pos + 1, []) : G.#fail(ctx, pos))
	}

	/** Rotula as capturas de `rule` como campo `name` do `node(...)` que as envolve (e resgata terminais). */
	static field(name: string, rule: TRule): TRule {
		return (ctx, pos) => {
			const result = rule(ctx, pos)
			if (!result.ok) return G.#FAIL
			return G.#ok(result.next, result.captures.map((capture) => ({ ...capture, field: name })))
		}
	}

	/** Referência lazy a uma regra nomeada — permite recursão. */
	static ref(name: string): TRule {
		return (ctx, pos) => {
			const rule = ctx.rules.get(name)
			if (!rule) throw new Error(`Language: regra "${name}" não registrada`)
			const key = `${name}@${pos}`
			const cached = ctx.memo.get(key)
			if (cached) return cached
			const result = rule(ctx, pos)
			ctx.memo.set(key, result)
			return result
		}
	}

	/**
	 * Casa o placeholder do escopo `scopeName` e **não desce** — vira 1 nó-folha (`kind = scopeName`)
	 * cobrindo o bloco inteiro. É o ponto de corte para lazy: quem quiser o conteúdo fatia
	 * `node.text` (ou, no futuro, pede `node.ast`) sob demanda; a gramática não paga o corpo.
	 */
	static placeholder(scopeName: string): TRule {
		return (ctx, pos) => {
			const token = ctx.tokens[pos]
			if (!token || token.kind !== SCOPE_KIND_PREFIX + scopeName) return G.#fail(ctx, pos)
			const node = new AstNode(scopeName, ctx.root, token.start, token.end)
			ctx.root.nodes.push(node)
			return G.#ok(pos + 1, [{ node }])
		}
	}

	/**
	 * Casa o placeholder do escopo `scopeName` e **desce**: tokeniza o stream direto daquele
	 * escopo (memoizado) e o parseia com `rule`. As capturas de dentro sobem para o `node(...)`
	 * externo. O pareamento `open`/`close` não é refeito — veio do `Parser`.
	 *
	 * `rule` aceita tanto o nome de uma regra registrada (`"ParamList"`, para permitir
	 * recursão/reuso) quanto uma regra inline (`G.sepBy(...)`) para composições ad-hoc que não
	 * merecem virar uma entrada nomeada em `grammar` — ex: `G.into("paren", G.sepBy(item, val(",")))`.
	 */
	static into(scopeName: string, rule: TRule | string): TRule {
		return (ctx, pos) => {
			const token = ctx.tokens[pos]
			if (!token || token.kind !== SCOPE_KIND_PREFIX + scopeName || !token.scope) return G.#fail(ctx, pos)
			const resolved = typeof rule === "string" ? ctx.rules.get(rule) : rule
			if (!resolved) throw new Error(`Language: regra "${rule}" não registrada`)
			const inner: TLangCtx = {
				...ctx,
				tokens: ctx.descend(token.scope),
				memo: new Map(),
			}
			const result = resolved(inner, 0)
			if (!result.ok) return G.#FAIL
			return G.#ok(pos + 1, result.captures)
		}
	}

	/**
	 * Constrói um `AstNode` de `kind` cobrindo tudo que `rule` consumiu. Entram como filhos:
	 * nós rotulados (`field`) e nós compostos. Terminais soltos (pontuação por `val`/`tok` sem
	 * `field`) são descartados.
	 */
	static node(kind: string, rule: TRule): TRule {
		return (ctx, pos) => {
			const result = rule(ctx, pos)
			if (!result.ok) return G.#FAIL

			const start = ctx.tokens[pos]?.start ?? 0
			const end = ctx.tokens[result.next - 1]?.end ?? start
			const created = new AstNode(kind, ctx.root, start, end)

			for (const capture of result.captures) {
				if (!capture.field && capture.leaf) continue
				capture.node.parent = created
				created.children.push(capture.node)
				if (!capture.field) continue
				const existing = created.fields.get(capture.field)
				if (existing === undefined) created.fields.set(capture.field, capture.node)
				else if (Array.isArray(existing)) existing.push(capture.node)
				else created.fields.set(capture.field, [existing, capture.node])
			}

			ctx.root.nodes.push(created)
			return G.#ok(result.next, [{ node: created }])
		}
	}

	/**
	 * Construção de baixo nível de um `AstNode` a partir de campos já resolvidos (não de um
	 * `TRule` casado) — escape hatch para combinadores que precisam montar um nó fora do fluxo
	 * normal de `seq`/`field` (`binary`, `chain`). Registra em `ctx.root.nodes` como `node()`.
	 */
	static build(ctx: TLangCtx, kind: string, start: number, end: number, fields: Record<string, AstNode | AstNode[]>): AstNode {
		const created = new AstNode(kind, ctx.root, start, end)
		for (const [field, value] of Object.entries(fields)) {
			for (const child of Array.isArray(value) ? value : [value]) {
				child.parent = created
				created.children.push(child)
			}
			created.fields.set(field, value)
		}
		ctx.root.nodes.push(created)
		return created
	}

	/**
	 * Cadeia binária esquerda-associativa **achatada**: 1 nó `kind` só, com `left` (1º operando)
	 * e `op`/`right` repetidos quando há mais de um operador do mesmo nível (`a + b + c` → um
	 * `BinaryExpr` com `left=a`, `op=[+,+]`, `right=[b,c]`) — não uma árvore binária real, mas
	 * suficiente pra reconhecer precedência sem multiplicar 1 nó por operador. Sem operador
	 * nenhum, devolve `operand` sem envolver em nada.
	 */
	static binary(kind: string, operand: TRule, op: TRule): TRule {
		return (ctx, pos) => {
			const first = operand(ctx, pos)
			if (!first.ok) return first

			const rest: TLangCapture[] = []
			let cursor = first.next
			let matched = false
			for (;;) {
				const opResult = op(ctx, cursor)
				if (!opResult.ok) break
				const rightResult = operand(ctx, opResult.next)
				if (!rightResult.ok) break
				matched = true
				for (const capture of opResult.captures) rest.push({ ...capture, field: "op" })
				for (const capture of rightResult.captures) rest.push({ ...capture, field: "right" })
				cursor = rightResult.next
			}
			if (!matched) return first

			const start = ctx.tokens[pos]?.start ?? 0
			const end = ctx.tokens[cursor - 1]?.end ?? start
			const created = new AstNode(kind, ctx.root, start, end)
			for (const capture of [...first.captures.map((capture) => ({ ...capture, field: "left" })), ...rest]) {
				capture.node.parent = created
				created.children.push(capture.node)
				const existing = created.fields.get(capture.field!)
				if (existing === undefined) created.fields.set(capture.field!, capture.node)
				else if (Array.isArray(existing)) existing.push(capture.node)
				else created.fields.set(capture.field!, [existing, capture.node])
			}
			ctx.root.nodes.push(created)
			return G.#ok(cursor, [{ node: created }])
		}
	}

	/**
	 * Encadeamento postfix esquerda-associativo: casa `base`, depois tenta repetidamente `step`
	 * — que recebe o `AstNode` já construído até aqui e devolve a `TRule` que, casando a partir
	 * dali, decide como envolvê-lo (ex: `a.b` → `MemberExpr{object: a, property: b}`, `f()` →
	 * `CallExpr{callee: f, args: […]}`). Um `step` que falha simplesmente encerra a cadeia — é
	 * exatamente `member/call/index/non-null` de uma `CallExpr` de expressões.
	 */
	static chain(base: TRule, step: (prev: AstNode) => TRule): TRule {
		return (ctx, pos) => {
			const first = base(ctx, pos)
			if (!first.ok) return first
			let node = first.captures[0]?.node
			if (!node) return first
			let cursor = first.next
			for (;;) {
				const result = step(node)(ctx, cursor)
				if (!result.ok || result.next === cursor) break
				const next = result.captures[0]?.node
				if (!next) break
				node = next
				cursor = result.next
			}
			return G.#ok(cursor, [{ node }])
		}
	}
}

export {
	G,
}
