import { TTokenRule } from "../../src/lexer/types"

/**
 * Regras de token para fonte TypeScript, no nível que o extrator de doc precisa hoje:
 * keywords de declaração, identificadores, pontuação estrutural, comentários e strings.
 *
 * Fica em `scripts/` de propósito — não é genérico. Graduará para `src/ast/ts/` quando
 * um segundo consumidor aparecer.
 *
 * Limitações aceitas nesta fatia:
 * - Template strings (` `...${...}...` `) não são delimitadas — um `\n` dentro de uma no
 *   nível de statement pode encurtar a varredura de `statementTail`. Inofensivo para o
 *   escaneamento de declarações top-level (que para no nome e pula corpos).
 * - `type` é sempre `keyword`, mesmo quando usado como identificador.
 */

const KEYWORDS = [
	"export", "default", "declare", "abstract",
	"class", "interface", "type", "function", "const", "let", "var", "enum", "namespace",
	"extends", "implements",
]

const PUNCTUATION = [
	"=>", "...", "?.", "??", "===", "!==", "==", "!=", "<=", ">=", "&&", "||",
	"{", "}", "(", ")", "[", "]", "<", ">", "=", ";", ",", ":", ".", "?", "!", "|", "&",
]

function isIdentStart(code: number): boolean {
	return (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 95 || code === 36
}

function isIdentContinue(code: number): boolean {
	return isIdentStart(code) || (code >= 48 && code <= 57)
}

function isDigit(code: number): boolean {
	return (code >= 48 && code <= 57) || code === 46
}

/** Cria o conjunto de regras (nova instância a cada chamada — sem estado compartilhado). */
function tsTokenRules(): TTokenRule[] {
	return [
		{
			kind: "comment", type: "delimited", open: "/*", close: "*/", trivia: true,
			subtype: (source, start, end) => (end - start > 4 && source.slice(start, start + 3) === "/**") ? "jsdoc" : undefined,
		},
		{ kind: "lineComment", type: "delimited", open: "//", close: "\n", consumeClose: false, trivia: true },
		{ kind: "string", type: "delimited", open: '"', close: '"' },
		{ kind: "string", type: "delimited", open: "'", close: "'" },
		{ kind: "keyword", type: "literal", values: KEYWORDS },
		{ kind: "punctuation", type: "literal", values: PUNCTUATION },
		{ kind: "identifier", type: "charClass", test: isIdentStart, continueTest: isIdentContinue },
		{ kind: "number", type: "charClass", test: (c) => c >= 48 && c <= 57, continueTest: isDigit },
		{ kind: "newline", type: "charClass", test: (c) => c === 10 || c === 13, trivia: true },
		{ kind: "space", type: "charClass", test: (c) => c === 32 || c === 9 || c === 11 || c === 12, trivia: true },
	]
}

export {
	tsTokenRules,
}
