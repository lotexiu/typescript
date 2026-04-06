import { _String } from "@tsn-string/generic/implementations";

/* TODO
- criar codigo dos modificadores
- criar codigo da quantidade
*/

/* Apenas um exemplo ficticio pois ainda não sei como devo imeplemtar exatamente os modicadores ainda.
export const MODIFIERS = { // Modificadores. mudam o comportamento do conteudo central
	s: 1, // Set
	i: 1, // Case-insensitive
	l: 1, // Literal
	$: 1, // End of string
	r: 1, // Recursive
	'^': 1, // Start of string
	'!': 1, // Negate
	'@': 1,// Referência a um pattern

	'<': 1, // LookBehind
	'<:': 1, // LookBehind com captura
	'<!': 1, // LookBehind negativo

	'>': 1, // LookAhead
	'>:': 1, // LookAhead com captura
	'>!': 1, // LookAhead negativo
}
 */
export const EXR = { // Todos os tipos abaixo são validações de um único caractere.
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
	m: (char: string) => char in EXR,
	M: (char: string) => !(char in EXR),
};

/* Exemplo ficticio. Ainda não sei como deveria estar criando QUANTITY, mas seria algo do tipo:
EXPORT CONST QUANTITY = {
	'*': { MIN: 0, MAX: INFINITY },
	'+': { MIN: 1, MAX: INFINITY },
	'?': { MIN: 0, MAX: 1 },
}
 */

/* Modelo de Sintaxe mais apoiado. Que as pessoas mais gostaram
	(Modificador/Centro/Quantidade)
	(i/a/3) 			-> Insensitive, Letra, 3 vezes.
	(L/abc|def/+)	-> Literal, "abc" OU "def", uma ou mais vezes.
*/
