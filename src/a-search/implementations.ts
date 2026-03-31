import { _String } from "@tsn-string/generic/implementations";

const exrLeft = {

}

const exr = {
	/* Letras e Números */
	w: _String.isIdentifier,
	W: _String.isIdentifier.negate(),

	/* Letras */
	a: _String.isLetter,
	A: _String.isLetter.negate(),
	l: _String.isLowerCase,
	L: _String.isLowerCase.negate(),
	u: _String.isUpperCase,
	U: _String.isUpperCase.negate(),

	/* Numéricos */
	d: _String.isDigit,
	D: _String.isDigit.negate(),
	h: _String.isHexadecimal,
	H: _String.isHexadecimal.negate(),

	/* Estruturais */
	g: _String.isFormatting,
	G: _String.isFormatting.negate(),
	s: _String.isWhitespace,
	S: _String.isWhitespace.negate(),
	b: _String.isLineBreak,
	B: _String.isLineBreak.negate(),
	t: _String.isTab,
	T: _String.isTab.negate(),
	r: _String.isCarriageReturn,
	R: _String.isCarriageReturn.negate(),
	f: _String.isFormFeed,
	F: _String.isFormFeed.negate(),
	v: _String.isVerticalTab,
	V: _String.isVerticalTab.negate(),

	/* Simbólicos */
	y: _String.isSymbol,
	Y: _String.isSymbol.negate(),
	x: _String.isMathOperator,
	X: _String.isMathOperator.negate(),
	p: _String.isPunctuation,
	P: _String.isPunctuation.negate(),

	/* Outros */
	e: _String.isEscape,
	E: _String.isEscape.negate(),
	'*': ()=>true, // anything
	m: (char: string) => char in exr,
	M: (char: string) => !(char in exr),
};

const exrRight = {

}

/**
 * PROPOSTAS DE SINTAXE PARA MOTOR DE BUSCA TRÍADE (Left | Center | Right)
 * * Estrutura:
 * [Left]   -> Modificadores (Case-insensitive, Literal, Negate, etc.)
 * [Center] -> O alvo da busca (Baseado no dicionário 'exr' ou string pura)
 * [Right]  -> Quantificadores e Lógica de Fluxo (Repetição, Boundary, EOF)
 * * -------------------------------------------------------------------------
 * OPÇÃO 0: O Modelo "|" (Alternância Simples)
 * Uso: (mod|centro|quant)
 * Característica: Usa o pipe '|' para separar as três partes, mas pode gerar
 * ambiguidade se o centro contiver alternâncias.
 * -------------------------------------------------------------------------
 * Exemplo 1: (i|a|3)     -> Busca 3 letras ignorando case.
 * Exemplo 2: (L|abc|def|+) -> Busca a string literal "abc" ou "def" uma ou mais vezes.
 * Exemplo 3: (!|d|1)     -> Busca algo que NÃO seja um dígito, exatamente uma vez.
 * * -------------------------------------------------------------------------
 * OPÇÃO 1: O Modelo "Encapsulado" (Delimitadores Distintos)
 * Uso: [mod]centro{quant}
 * Característica: Usa colchetes e chaves para isolar as extremidades.
 * -------------------------------------------------------------------------
 * Exemplo 1: [i]a{3}     -> Busca 3 letras ignorando case.
 * Exemplo 2: [L](ref){+} -> Busca a string literal "(ref)" uma ou mais vezes.
 * Exemplo 3: [!]d{1}     -> Busca algo que NÃO seja um dígito, exatamente uma vez.
 * * -------------------------------------------------------------------------
 * OPÇÃO 2: O Modelo "Scoped Pipe" (Substituição ao | de Alternância)
 * Uso: (mod / centro / quant)
 * Característica: Usa a barra (slash) como separador, já que o pipe '|'
 * será usado para o operador lógico "OU" dentro do centro.
 * -------------------------------------------------------------------------
 * Exemplo 1: (i/a/3)     -> Insensitive, Letra, 3 vezes.
 * Exemplo 2: (L/abc|def/+) -> Literal, "abc" OU "def", uma ou mais vezes.
 * * -------------------------------------------------------------------------
 */
