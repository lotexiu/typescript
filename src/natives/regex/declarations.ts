const DATE = {
	DAY: '(3[01]|[12][0-9]|0?[1-9])',
	MONTH: '(1[0-2]|0?[1-9])',
	YEAR: '(\\d{4})',
	SEPARATOR: '([\\/-])',
} as const

const REGEX_PATTERNS = {
	DATE: {
		...DATE,
		ISO: `${DATE.YEAR}${DATE.SEPARATOR}${DATE.MONTH}\\2${DATE.DAY}`,
		MDY: `${DATE.MONTH}${DATE.SEPARATOR}${DATE.DAY}\\2${DATE.YEAR}`,
		DMY: `${DATE.DAY}${DATE.SEPARATOR}${DATE.MONTH}\\2${DATE.YEAR}`,
	},
	WHITESPACE: {
		BASIC: '\\s',
		EXTENDED: '\\p{Z}',
		LINE_BREAK: '\\r\\n|\\r|\\n',
	},
	LETTERS: {
		BASIC: {
			ALL: '[A-Za-z]',
			UPPERCASE: '[A-Z]',
			LOWERCASE: '[a-z]',
		},
		EXTENDED: {
			ALL: '\\p{L}',
			UPPERCASE: '\\p{Lu}',
			LOWERCASE: '\\p{Ll}',
		},
	},
	WORD: {
		BASIC: '\\w',
		EXTENDED: '[\\p{L}\\p{N}_]',
	},
	DIGITS: {
		BASIC: '[0-9]',
		EXTENDED: '\\p{Nd}',
		ROMAN: '[IVXLCDM]',
		HEX: '[0-9a-fA-F]',
	},
	SYMBOLS: {
		PUNCTUATION: {
			BASIC: '[^\\w\\s]',
			EXTENDED: '\\p{P}',
			MATH: '\\p{Sm}',
		},
		CURRENCY: '\\p{Sc}',
		PRESENTATION: '\\p{Emoji_Presentation}',
		EMOJI: '\\p{RGI_Emoji}',
		ALL: '\\p{Emoji}',
	},
} as const

export {
	REGEX_PATTERNS,
}