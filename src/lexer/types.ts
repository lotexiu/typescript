type TToken = {
	kind: string
	start: number
	end: number
	value: string
}

type TTokenLiteralRule = {
	kind: string
	type: 'literal'
	values: string[]
}

type TTokenCharClassRule = {
	kind: string
	type: 'charClass'
	/** Testado só no 1º char do run. */
	test: (code: number) => boolean
	/** Testado do 2º char em diante — ex: identificador começa em letra, continua em letra-ou-dígito. Default: mesmo predicado de `test`. */
	continueTest?: (code: number) => boolean
}

/** Vira um `ParserGate` opaco internamente — conteúdo entre `open`/`close` nunca é tokenizado por outra regra, o node inteiro (com os delimitadores, salvo `consumeClose: false`) vira 1 token só. */
type TTokenDelimitedRule = {
	kind: string
	type: 'delimited'
	open: string
	close: string
	/** false = o `close` não entra no token (ex: comentário de linha terminado por `\n` — a quebra de linha fica de fora, tokenizada normal como whitespace). Default: true. */
	consumeClose?: boolean
}

type TTokenRule = TTokenLiteralRule | TTokenCharClassRule | TTokenDelimitedRule

export {
	TToken,
	TTokenRule,
	TTokenLiteralRule,
	TTokenCharClassRule,
	TTokenDelimitedRule,
}
