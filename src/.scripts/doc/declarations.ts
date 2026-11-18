const DOC_REGEX = {
	JSDOC_OPEN: new RegExp("^/\\*\\*"),
	JSDOC_CLOSE: new RegExp("\\*/$"),
	JSDOC_LINE_PREFIX: new RegExp("^\\s*\\*?\\s?"),
	TAG: new RegExp("^@(\\S+)\\s*([\\s\\S]*)$"),
	WHITESPACE_RUNS: new RegExp("\\s+", "g"),
	TRAILING_ASSIGNMENT: new RegExp("\\s*=\\s*$"),
	TRAILING_ARROW: new RegExp("\\s*=>\\s*$"),
	TRAILING_SEMICOLON: new RegExp("[\\s;]+$"),
	BACKSLASH: new RegExp("\\\\", "g"),
	NON_ANCHOR_CHARACTERS: new RegExp("[^a-z0-9_-]", "g"),
	TABLE_PIPE: new RegExp("\\|", "g"),
	LEADING_DASH: new RegExp("^-\\s*"),
	NEWLINE_INDENT: new RegExp("\\n\\s*", "g"),
	BLANK_LINE: new RegExp("\\n[ \\t]*\\n"),
	EXTENDS: new RegExp("\\bextends\\s+([A-Za-z_$][\\w$]*)"),
}

const SIGNATURE_SINGLE_LINE_LIMIT = 110

const INITIALIZER_PREVIEW_LIMIT = 60

const HIDDEN_MODIFIERS: ReadonlySet<string> = new Set(["private", "protected"])

const VISIBLE_MODIFIERS: ReadonlySet<string> = new Set(["static", "readonly", "abstract", "async", "override"])

export { DOC_REGEX, SIGNATURE_SINGLE_LINE_LIMIT, INITIALIZER_PREVIEW_LIMIT, HIDDEN_MODIFIERS, VISIBLE_MODIFIERS }
