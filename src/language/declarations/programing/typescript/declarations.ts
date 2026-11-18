import type { TLanguageSpec } from "@ts/language/types";
import { KEYWORDS } from "./keywords";
import { DECL_RULES } from "./grammar-decl";
import { EXPR_RULES } from "./grammar-expr";
import { SHARED_RULES } from "./grammar-shared";
import { STMT_RULES } from "./grammar-stmt";
import { TYPE_RULES } from "./grammar-type";
import { TS_VALIDATIONS } from "./validations";

/**
 * `TypescriptLang` — espec declarativa de TypeScript pra cima do motor de `src/language`.
 * Cobre módulos (`import`/`export` em todas as formas comuns), declarações (`class`/
 * `interface`/`type`/`function`/`const`/`let`/`var`/`enum`/`namespace`, com corpo real —
 * membros de classe, statements, expressões), tipos (union/intersection/generics/mapped/
 * condicional/tupla/função) e expressões (precedência completa, arrow functions, template
 * literals, optional chaining, generics em chamada). A gramática em si (`grammar-*.ts`) está
 * dividida por camada — cada arquivo só referencia as outras por nome (`G.ref`), nunca importa
 * o objeto, então não há ciclo de import possível entre eles.
 *
 * Limitações aceitas (não é um parser de TS 100% completo — ver também os JSDocs de cada
 * `grammar-*.ts`):
 *  - Sem regex literal (`/…/`): dado que `/` também é divisão, decidir qual dos dois exige
 *    contexto do token anterior (lookback), que o `Parser`/`ParserGate` atuais não têm — não
 *    dá pra declarar como `delimited` sem quebrar toda expressão com divisão. Registrado como
 *    ideia de evolução do `Parser`, não implementado aqui.
 *  - `>>`, `>>>`, `>=`, `>>=` e `>>>=` não são tokens: o lexer só produz `>` e `=`, e a gramática
 *    reconhece os operadores pelos tokens **colados** (`G.adjacent`). Assim `Array<Array<T>>` e
 *    `Map<K, Set<T>>= x` fecham os generics sem ambiguidade.
 *  - Sem JSX.
 *  - ASI não é simulada — `;` é sempre opcional nos pontos onde apareceria, sem checar quebra
 *    de linha (afeta principalmente `UpdateExpr` postfix `a\n++b`, tratado como `a++; b`).
 *  - Palavras "quase-reservadas" (`CONTEXTUAL_KEYWORDS`: `type`, `get`, `set`, `of`, `out`...) são
 *    tokens `keyword`, mas a regra `Identifier` também as aceita como nome de variável, parâmetro
 *    e em expressões — as declarações (`type X = …`) são tentadas antes das expressões.
 */

const isIdentStart = (code: number): boolean =>
	(code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 95 || code === 36 || code === 35;

const isIdentContinue = (code: number): boolean => isIdentStart(code) || (code >= 48 && code <= 57);

const isDigit = (code: number): boolean => code >= 48 && code <= 57;

const DOT_CODE = 46;

/**
 * Depois do 1º dígito: dígitos, `.`, `_` (separador) e letras — cobre `0xFF`, `0b1010`, `0o17`, `1_000`, `10n` (BigInt)
 * e `1e10`. Nenhum identificador começa com dígito, então letras coladas num número só podem ser parte dele.
 * Expoente com sinal (`1e-7`) não é coberto: o `-` vira operador.
 */
const isNumberContinue = (code: number): boolean => isIdentContinue(code) || code === DOT_CODE;





/** Sem `>>`/`>>>`/`>=`/`>>=`/`>>>=` — ver "Limitações aceitas" no topo do arquivo. */
const PUNCTUATION = [
	"=>", "...", "?.", "??=", "??", "===", "!==", "==", "!=", "<=", "&&=", "&&", "||=", "||",
	"**=", "**", "++", "--", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", "<<",
	"<", ">", "=", ";", ",", ":", ".", "?", "!", "|", "&", "+", "-", "*", "/", "%", "^", "~", "@",
] as const;

/**
 * Espec de TypeScript sobre o motor `Language`: tipos, expressões, statements e declarações com corpo. Use com `Language.define(TypescriptLang)`; ver as limitações aceitas no topo deste arquivo.
 */
const TypescriptLang: TLanguageSpec = {
	scope: {
		block: ["{", "}"],
		paren: ["(", ")"],
		bracket: ["[", "]"],
	},
	delimited: {
		blockComment: {
			open: "/*",
			close: "*/",
			trivia: true,
			subtype: (source, start, end) => (end - start > 4 && source.slice(start, start + 3) === "/**" ? "jsdoc" : undefined),
		},
		lineComment: { open: "//", close: "\n", consumeClose: false, trivia: true },
		string: [
			{ open: '"', close: '"' },
			{ open: "'", close: "'" },
		],
		template: { open: "`", close: "`", interpolate: ["${", "}"] },
	},
	charClass: {
		space: { start: (charCode) => charCode === 32 || charCode === 9 || charCode === 11 || charCode === 12, trivia: true },
		newline: { start: (charCode) => charCode === 10 || charCode === 13, trivia: true },
		identifier: { start: isIdentStart, continue: isIdentContinue },
		number: { start: isDigit, continue: isNumberContinue },
	},
	literal: {
		keyword: [...KEYWORDS],
		punctuation: [...PUNCTUATION],
	},
	grammar: {
		...SHARED_RULES,
		...TYPE_RULES,
		...EXPR_RULES,
		...STMT_RULES,
		...DECL_RULES,
	},
	start: "File",
	escape: "\\",
	validate: TS_VALIDATIONS,
};

export { TypescriptLang };
