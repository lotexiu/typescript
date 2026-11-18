/** Um padrão encontrado. */
type TAhoCorasickMatch = {
	/** Índice do padrão em `compile`. */
	patternId: number
	/** Offset inicial. */
	start: number
	/** Offset final (exclusivo). */
	end: number
}

/** Chamado a cada posição; retornar `N` (> 0) pula `N` caracteres a partir dela. */
type TOnPositionHook = (index: number, code: number) => number | void

/** Chamado a cada match; retornar `false` o deixa fora do resultado. */
type TOnMatchHook = (patternId: number, start: number, end: number) => boolean | void

/** Ganchos opcionais de `scan`. */
type TAhoCorasickScanHooks = {
	/** Ver `TOnPositionHook`. */
	onPosition?: TOnPositionHook
	/** Ver `TOnMatchHook`. */
	onMatch?: TOnMatchHook
}

export {
	TAhoCorasickMatch,
	TOnPositionHook,
	TOnMatchHook,
	TAhoCorasickScanHooks,
}
