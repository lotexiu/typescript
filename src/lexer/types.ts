type TToken = {
	kind: string
	start: number
	end: number
	value: string
}

/** Marca o `kind` como trivia (espaço, comentário, ...) — não muda a tokenização, só é um hint pra quem consome os tokens (ex: `Grammar.parse`'s `skipKinds`, via `Lexer.triviaKinds`) ignorar automaticamente. */
type TTokenTrivia = {
	trivia?: boolean
}

type TTokenLiteralRule = TTokenTrivia & {
	kind: string
	type: 'literal'
	values: string[]
}

type TTokenCharClassRule = TTokenTrivia & {
	kind: string
	type: 'charClass'
	/** Testado só no 1º char do run. */
	test: (code: number) => boolean
	/** Testado do 2º char em diante — ex: identificador começa em letra, continua em letra-ou-dígito. Default: mesmo predicado de `test`. */
	continueTest?: (code: number) => boolean
}

/** Vira um `ParserGate` opaco internamente — conteúdo entre `open`/`close` nunca é tokenizado por outra regra, o node inteiro (com os delimitadores, salvo `consumeClose: false`) vira 1 token só. */
type TTokenDelimitedRule = TTokenTrivia & {
	kind: string
	type: 'delimited'
	open: string
	close: string
	/** false = o `close` não entra no token (ex: comentário de linha terminado por `\n` — a quebra de linha fica de fora, tokenizada normal como whitespace). Default: true. */
	consumeClose?: boolean
	/**
	 * Roda 1x por match (não por char) — recebe offsets em vez do `value` já fatiado, pra não forçar
	 * slice de blocos grandes só pra testar um prefixo. Retornar um `kind` troca o `kind` da rule
	 * só para esse token (ex: `/**` dentro de `comment` virar `jsdoc`); `undefined` mantém `kind`.
	 */
	subtype?: (source: string, start: number, end: number) => string | undefined
}

type TTokenRule = TTokenLiteralRule | TTokenCharClassRule | TTokenDelimitedRule

export {
	TToken,
	TTokenRule,
	TTokenLiteralRule,
	TTokenCharClassRule,
	TTokenDelimitedRule,
}
