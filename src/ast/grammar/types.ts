import type { TToken } from "@ts/lexer/types"
import type { AstNode, AstRoot } from "@ts/ast/node/model"
import type { Grammar } from "./model"

/**
 * Uma captura produzida por um matcher: um nó, opcionalmente rotulado como campo.
 * `leaf` marca nós vindos de um terminal (`tok`/`val`/`kindVal`) — se não forem
 * nomeados por um `field`, `node(...)` os descarta (pontuação não entra na árvore).
 */
type TCapture = {
	field?: string
	leaf?: boolean
	node: AstNode
}

/** Resultado de um matcher numa dada posição de token. */
type TMatchResult =
	| { ok: true; next: number; captures: TCapture[] }
	| { ok: false }

/** Estado compartilhado durante um `Grammar.parse` — passado a todo matcher. */
type TGrammarCtx = {
	readonly tokens: TToken[]
	readonly root: AstRoot
	readonly grammar: Grammar
	/** Memo packrat por regra nomeada: `"<rule>@<pos>"` → resultado. */
	readonly memo: Map<string, TMatchResult>
	/** Posição de token mais distante em que algum matcher falhou (diagnóstico). */
	furthest: number
}

/** Função de reconhecimento: consome tokens a partir de `pos` e devolve o resultado. */
type TMatcher = (ctx: TGrammarCtx, pos: number) => TMatchResult

export {
	TCapture,
	TMatchResult,
	TGrammarCtx,
	TMatcher,
}
