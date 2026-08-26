type TPattern = {
	id: number
	value: string
}

type TAhoCorasickMatch = {
	patternId: number
	start: number
	end: number
}

/** Hook pré-match, chamado por posição antes de tentar casar padrão. Retornar um número pula essa quantidade de chars (ex: escape); `void` segue o fluxo normal. */
type TOnPositionHook = (index: number, code: number) => number | void

/** Hook pós-match — decide se o candidato é válido no contexto do consumidor (ex: Parser rejeitando close de gate errado ou match dentro de escopo opaco). `false` rejeita, qualquer outro retorno aceita. */
type TOnMatchHook = (match: TAhoCorasickMatch) => boolean | void

type TAhoCorasickScanHooks = {
	onPosition?: TOnPositionHook
	onMatch?: TOnMatchHook
}

export {
	TPattern,
	TAhoCorasickMatch,
	TOnPositionHook,
	TOnMatchHook,
	TAhoCorasickScanHooks,
}
