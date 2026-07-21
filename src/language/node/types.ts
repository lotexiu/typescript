import type { AstNode } from "./model"

/** Callback de `AstNode.walk` / `AstRoot.walk` — retornar `false` poda a subárvore atual. */
type TAstVisitor = (node: AstNode) => boolean | void

export {
	TAstVisitor,
}
