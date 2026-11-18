/**
 * @internal
 * Palavras reservadas e contextuais do `TypescriptLang` — tokens `keyword`.
 */
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

/**
 * @internal
 * Palavras-chave que também são nomes válidos em JS (`const type = 1`, `map.set(...)`, `out.push(...)`).
 */
const CONTEXTUAL_KEYWORDS = [
	"as", "satisfies", "keyof", "infer", "is", "asserts", "unique", "out", "get", "set", "of", "type",
	"from", "declare", "module", "namespace", "async", "abstract", "override", "readonly",
] as const;

export { KEYWORDS, CONTEXTUAL_KEYWORDS };
