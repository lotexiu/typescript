import { TTokenRule } from "@ts/lexer/types";

// const ts = {
// 	keywords: {
// 		values: ["true", "false", "null", "undefined"],
// 		modifiers: ["declare", "abstract", "override", "export", "default", "async"],
// 		declarations: ["namespace", "interface", "function", "class", "enum", "type", "const", "let", "var", "import", "from", "as"],
// 		memberModifiers: ["public", "private", "protected", "static", "readonly"],
// 		inheritance: ["implements", "extends"],
// 		flow: ["if", "else", "for", "while", "do", "switch", "case", "break", "continue", "return", "throw"],
// 		handlers: ["try", "catch", "finally"],
// 	},
// };

const a: TTokenRule[] = [
	{ type: "literal", kind: "modifiers", values: ["declare", "abstract", "override", "export", "default", "async"] },
	{ type: "literal", kind: "declare", values: ["let", "const", "var", "enum", "function", "class", "namespace", "type", "interface"] },
	{ type: "literal", kind: "inheritance", values: ["implements", "extends"] },
	{ type: "literal", kind: "handlers", values: ["try", "catch", "finally"] },
	{ type: "literal", kind: "literal", values: ["true", "false", "null", "undefined"] },
	{ type: "delimited", kind: "string", open: '"', close: '"' },
	{ type: "delimited", kind: "string", open: "'", close: "'" },
	{ type: "delimited", kind: "template", open: "`", close: "`" },
	// { type: "literal", kind: "arithmetic", values: ["+", "-", "*", "/", "%"] },
	// { type: "literal", kind: "logical", values: ["&&", "||", "!", "??"] },
];
