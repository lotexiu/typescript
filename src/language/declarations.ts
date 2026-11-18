/**
 * @internal
 * Prefixo do `kind` de um token-placeholder de escopo aninhado (`scope:block`, `scope:paren`).
 * `G.into` / `G.placeholder` casam por esse `kind`.
 */
const SCOPE_KIND_PREFIX = "scope:"

/**
 * `kind` dos nós que `G.skip()` deixa na árvore — tokens que nenhuma regra reconheceu.
 */
const SKIPPED_KIND = "Skipped"

export {
	SCOPE_KIND_PREFIX,
	SKIPPED_KIND,
}
