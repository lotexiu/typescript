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

/**
 * Hook pós-match — decide se o candidato é válido no contexto do consumidor (ex: Parser rejeitando
 * close de gate errado ou match dentro de escopo opaco). `false` rejeita, qualquer outro retorno aceita.
 * Recebe os 3 campos soltos (não um `TAhoCorasickMatch`) de propósito — em textos com muitos matches
 * (ex: padrões de 1-2 chars do Lexer), alocar 1 objeto por candidato só pra descartar teria custo
 * real (ver benchmark de `test/lexer.ts`); quem quiser guardar o match monta o objeto ele mesmo.
 */
type TOnMatchHook = (patternId: number, start: number, end: number) => boolean | void

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
