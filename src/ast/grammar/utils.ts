import { TToken } from "@ts/lexer/types"
import { AstNode } from "@ts/ast/node/model"
import { TCapture, TGrammarCtx, TMatcher, TMatchResult } from "./types"

/**
 * Combinadores para montar regras de `Grammar` — todos `static`, sem estado. Cada um
 * devolve um `TMatcher`; compõem-se livremente (`seq(choice(...), many(...))`). Chamadas
 * entre irmãos usam sempre `GrammarUtils.x` (nunca `this`) para sobreviver a destructuring
 * no consumidor.
 */
class GrammarUtils {
	private static readonly FAIL: TMatchResult = { ok: false }

	private static ok(next: number, captures: TCapture[]): TMatchResult {
		return { ok: true, next, captures }
	}

	/** Nó-folha a partir de um token — guarda o `value` como texto, sem re-fatiar a fonte. */
	private static leaf(ctx: TGrammarCtx, token: TToken): AstNode {
		const astNode = new AstNode(token.kind, ctx.root, token.start, token.end, token.value)
		ctx.root.nodes.push(astNode)
		return astNode
	}

	private static fail(ctx: TGrammarCtx, pos: number): TMatchResult {
		if (pos > ctx.furthest) ctx.furthest = pos
		return GrammarUtils.FAIL
	}

	/** Casa 1 token de um dado `kind`. */
	static tok(kind: string): TMatcher {
		return (ctx, pos) => {
			const token = ctx.tokens[pos]
			if (!token || token.kind !== kind) return GrammarUtils.fail(ctx, pos)
			return GrammarUtils.ok(pos + 1, [{ node: GrammarUtils.leaf(ctx, token), leaf: true }])
		}
	}

	/** Casa 1 token com um dado `value` literal, de qualquer `kind`. */
	static val(value: string): TMatcher {
		return (ctx, pos) => {
			const token = ctx.tokens[pos]
			if (!token || token.value !== value) return GrammarUtils.fail(ctx, pos)
			return GrammarUtils.ok(pos + 1, [{ node: GrammarUtils.leaf(ctx, token), leaf: true }])
		}
	}

	/** Casa 1 token por `kind` e `value` ao mesmo tempo. */
	static kindVal(kind: string, value: string): TMatcher {
		return (ctx, pos) => {
			const token = ctx.tokens[pos]
			if (!token || token.kind !== kind || token.value !== value) return GrammarUtils.fail(ctx, pos)
			return GrammarUtils.ok(pos + 1, [{ node: GrammarUtils.leaf(ctx, token), leaf: true }])
		}
	}

	/** Casa qualquer 1 token (sempre avança se houver token) — fallback de skip. */
	static anyToken(): TMatcher {
		return (ctx, pos) => (ctx.tokens[pos] ? GrammarUtils.ok(pos + 1, []) : GrammarUtils.fail(ctx, pos))
	}

	/** Sequência: todos os matchers em ordem, concatenando capturas. */
	static seq(...matchers: TMatcher[]): TMatcher {
		return (ctx, pos) => {
			const captures: TCapture[] = []
			let cursor = pos
			for (const matcher of matchers) {
				const result = matcher(ctx, cursor)
				if (!result.ok) return GrammarUtils.FAIL
				captures.push(...result.captures)
				cursor = result.next
			}
			return GrammarUtils.ok(cursor, captures)
		}
	}

	/** Escolha ordenada (PEG): o primeiro matcher que casa vence. */
	static choice(...matchers: TMatcher[]): TMatcher {
		return (ctx, pos) => {
			for (const matcher of matchers) {
				const result = matcher(ctx, pos)
				if (result.ok) return result
			}
			return GrammarUtils.fail(ctx, pos)
		}
	}

	/** Zero ou mais repetições (para ao primeiro fail ou ao deixar de avançar). */
	static many(matcher: TMatcher): TMatcher {
		return (ctx, pos) => {
			const captures: TCapture[] = []
			let cursor = pos
			for (;;) {
				const result = matcher(ctx, cursor)
				if (!result.ok || result.next === cursor) break
				captures.push(...result.captures)
				cursor = result.next
			}
			return GrammarUtils.ok(cursor, captures)
		}
	}

	/** Uma ou mais repetições. */
	static many1(matcher: TMatcher): TMatcher {
		return GrammarUtils.seq(matcher, GrammarUtils.many(matcher))
	}

	/** Opcional — sempre casa; sem capturas quando ausente. */
	static opt(matcher: TMatcher): TMatcher {
		return (ctx, pos) => {
			const result = matcher(ctx, pos)
			return result.ok ? result : GrammarUtils.ok(pos, [])
		}
	}

	/** `matcher` separado por `separator` (zero ou mais itens). */
	static sepBy(matcher: TMatcher, separator: TMatcher): TMatcher {
		return GrammarUtils.opt(GrammarUtils.seq(matcher, GrammarUtils.many(GrammarUtils.seq(separator, matcher))))
	}

	/** Lookahead positivo de largura zero. */
	static ahead(matcher: TMatcher): TMatcher {
		return (ctx, pos) => (matcher(ctx, pos).ok ? GrammarUtils.ok(pos, []) : GrammarUtils.fail(ctx, pos))
	}

	/** Lookahead negativo de largura zero. */
	static notAhead(matcher: TMatcher): TMatcher {
		return (ctx, pos) => (matcher(ctx, pos).ok ? GrammarUtils.fail(ctx, pos) : GrammarUtils.ok(pos, []))
	}

	/**
	 * Rotula as capturas de `matcher` como campo `name` do `node(...)` que as envolve.
	 * Rotular também "resgata" um terminal — um `field("x", val("("))` mantém o `(` na
	 * árvore, enquanto um `val("(")` solto seria descartado.
	 */
	static field(name: string, matcher: TMatcher): TMatcher {
		return (ctx, pos) => {
			const result = matcher(ctx, pos)
			if (!result.ok) return GrammarUtils.FAIL
			return GrammarUtils.ok(result.next, result.captures.map((capture) => ({ ...capture, field: name })))
		}
	}

	/** Referência lazy a uma regra nomeada da gramática — permite recursão. */
	static ref(name: string): TMatcher {
		return (ctx, pos) => ctx.grammar.matcher(name)(ctx, pos)
	}

	/**
	 * Constrói um `AstNode` de `kind` cobrindo tudo que `matcher` consumiu. Entram como
	 * filhos: nós rotulados (`field`) e nós compostos (de um `node(...)` interno). Terminais
	 * soltos (pontuação casada por `val`/`tok` sem `field`) são descartados — a árvore só
	 * guarda o que tem significado.
	 */
	static node(kind: string, matcher: TMatcher): TMatcher {
		return (ctx, pos) => {
			const result = matcher(ctx, pos)
			if (!result.ok) return GrammarUtils.FAIL

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
			return GrammarUtils.ok(result.next, [{ node: created }])
		}
	}
}

export {
	GrammarUtils,
}
