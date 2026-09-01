const tsLang = {
	scope: {
		block: { open: "{", close: "}" },
		array: { open: "[", close: "]" },
		function: { open: "(", close: ")" },
	},
	delimited: {
		jsDoc: { open: "/**", close: "*/" },
		template: { open: "`", close: "`" },
		comment: [
			{ open: "//", close: "\n" },
			{ open: "/*", close: "*/" },
		],
		string: [
			{ open: '"', close: '"' },
			{ open: "'", close: "'" },
		],
	},
	literal: {
		inheritance: ["implements", "extends"],
		memberModifier: ["public", "protected", "private", "static", "readonly"],
		modifiers: ["declare", "abstract", "override", "export", "default", "async"],
		declare: ["let", "const", "var", "enum", "function", "class", "namespace", "type", "interface"],
		literal: ["true", "false", "null", "undefined"],
		handlers: ["try", "catch", "finally"],
		assign: ["=", "+=", "-=", "*=", "/=", "%=", "**=", "<<=", ">>=", ">>>=", "&=", "^=", "|=", "&&=", "||=", "??="],
	},
} as const

export {
	tsLang
}