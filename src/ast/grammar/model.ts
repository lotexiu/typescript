import { TToken } from "@ts/lexer/types"
import { AstRoot } from "@ts/ast/node/model"
import { TGrammarCtx, TMatcher, TMatchResult } from "./types"

/**
 * Motor de gramática declarativo sobre um stream de tokens (`Lexer.tokens`). Regras são
 * montadas com os combinadores de `GrammarUtils`; `parse` devolve uma `AstRoot`. Cada
 * regra nomeada é memoizada por posição (packrat) — tempo linear.
 */
class Grammar {
	private readonly rules = new Map<string, TMatcher>()
	private startRule?: string

	/** Registra (ou substitui) uma regra nomeada. Encadeável. */
	rule(name: string, matcher: TMatcher): this {
		this.rules.set(name, matcher)
		return this
	}

	/** Define a regra de entrada do `parse`. Encadeável. */
	start(name: string): this {
		this.startRule = name
		return this
	}

	/** Matcher memoizado de uma regra nomeada — usado internamente por `GrammarUtils.ref`. */
	matcher(name: string): TMatcher {
		const rule = this.rules.get(name)
		if (!rule) throw new Error(`Grammar: regra "${name}" não registrada`)
		return (ctx, pos) => {
			const key = `${name}@${pos}`
			const cached = ctx.memo.get(key)
			if (cached) return cached
			const result = rule(ctx, pos)
			ctx.memo.set(key, result)
			return result
		}
	}

	/**
	 * Roda a regra-start sobre `tokens` e devolve a árvore. Nós de topo viram `root.children`.
	 * `skipKinds` (ex: `Lexer.triviaKinds`) remove esses `kind`s de `tokens` antes de parsear —
	 * equivalente a `tokens.filter(...)` na chamada, só que embutido.
	 */
	parse(tokens: TToken[], source: string, skipKinds?: ReadonlySet<string>): AstRoot {
		if (!this.startRule) throw new Error("Grammar: nenhuma regra-start definida")
		const effectiveTokens = skipKinds && skipKinds.size ? tokens.filter((token) => !skipKinds.has(token.kind)) : tokens
		const root = new AstRoot(source)
		const ctx: TGrammarCtx = { tokens: effectiveTokens, root, grammar: this, memo: new Map(), furthest: 0 }

		const result: TMatchResult = this.matcher(this.startRule)(ctx, 0)
		if (result.ok) {
			for (const capture of result.captures) {
				if (!capture.field && capture.leaf) continue
				capture.node.parent = root
				root.children.push(capture.node)
			}
		}
		return root
	}
}

export {
	Grammar,
}
