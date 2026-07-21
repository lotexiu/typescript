import type { TLanguageSpec } from "@ts/language/types";
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
 *  - Sem `>>`/`>>>`/`>>=`/`>>>=`: colidiria com o fechamento de generics aninhados
 *    (`Array<Array<T>>`) — o `>>` venceria por maximal munch antes da gramática decidir que
 *    são dois `>` fechando dois `TypeArgs`. Shift à direita fica sem suporte; `<<` continua ok
 *    (não conflita com abertura de generics).
 *  - Sem JSX.
 *  - ASI não é simulada — `;` é sempre opcional nos pontos onde apareceria, sem checar quebra
 *    de linha (afeta principalmente `UpdateExpr` postfix `a\n++b`, tratado como `a++; b`).
 *  - Uma palavra "quase-reservada" (`as`, `type`, `satisfies`, `get`, `set`, `of`, ...) não pode
 *    ser usada como nome de binding nesta gramática, mesmo sendo legal em JS de verdade — ver
 *    `literal.keyword` abaixo.
 */

const isIdentStart = (code: number): boolean =>
	(code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 95 || code === 36 || code === 35;

const isIdentContinue = (code: number): boolean => isIdentStart(code) || (code >= 48 && code <= 57);

const isDigit = (code: number): boolean => code >= 48 && code <= 57;

const KEYWORDS = [
	"import", "export", "declare", "from", "default",
	"const", "let", "var",
	"function", "return", "yield", "async", "await",
	"class", "interface", "type", "enum", "namespace", "module",
	"extends", "implements", "super", "this", "new", "delete", "typeof", "instanceof", "in", "of", "void",
	"if", "else", "for", "while", "do", "switch", "case", "break", "continue",
	"try", "catch", "finally", "throw",
	"public", "private", "protected", "readonly", "static", "abstract", "override",
	"true", "false", "null", "undefined",
	"as", "satisfies", "keyof", "infer", "is", "asserts", "unique", "out",
	"get", "set",
] as const;

/** Sem `>>`/`>>>`/`>>=`/`>>>=` — ver "Limitações aceitas" no topo do arquivo. */
const PUNCTUATION = [
	"=>", "...", "?.", "??=", "??", "===", "!==", "==", "!=", "<=", ">=", "&&=", "&&", "||=", "||",
	"**=", "**", "++", "--", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", "<<",
	"<", ">", "=", ";", ",", ":", ".", "?", "!", "|", "&", "+", "-", "*", "/", "%", "^", "~", "@",
] as const;

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
		space: { start: (c) => c === 32 || c === 9 || c === 11 || c === 12, trivia: true },
		newline: { start: (c) => c === 10 || c === 13, trivia: true },
		identifier: { start: isIdentStart, continue: isIdentContinue },
		number: { start: isDigit, continue: (c) => isDigit(c) || c === 46 },
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
