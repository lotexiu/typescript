import { REGEX_PATTERNS } from '@tsn/regex/declarations';
import { TStrForEeachCallback, TStrOnCharCallback } from './types';
import { RegexUtils } from '@tsn/regex/utils';
import { STRING_REGEX } from './declarations';

const { LETTERS, DIGITS, WHITESPACE, SYMBOLS } = REGEX_PATTERNS;

/**
 * String helpers aware of Unicode: emoji and other astral characters count as one character where it matters.
 * The `is*` checks take a single character; with `extended` they use Unicode properties.
 */
class StringUtils {
	static readonly #SEGMENTER = new Intl.Segmenter();

	/** Code unit of a space. */
	static readonly WHITESPACE_CODE = ' '.charCodeAt(0);
	/** Code unit of a backslash. */
	static readonly ESCAPE_CODE = '\\'.charCodeAt(0);
	/** Code unit of a tab. */
	static readonly TAB_CODE = '\t'.charCodeAt(0);
	/** Code unit of a line feed. */
	static readonly NEWLINE_CODE = '\n'.charCodeAt(0);
	/** Code unit of a vertical tab. */
	static readonly VERTICAL_TAB_CODE = '\v'.charCodeAt(0);
	/** Code unit of a form feed. */
	static readonly FORM_FEED_CODE = '\f'.charCodeAt(0);
	/** Code unit of a carriage return. */
	static readonly CARRIAGE_RETURN_CODE = '\r'.charCodeAt(0);
	/** First and last code units of the ASCII formatting characters (tab to carriage return). */
	static readonly FORMAT_CODE_DISTANCE = [
		StringUtils.TAB_CODE,
		StringUtils.CARRIAGE_RETURN_CODE,
	] as const;
	/** Code units of `0` and `9`. */
	static readonly DIGIT_CODE_DISTANCE = ['0'.charCodeAt(0), '9'.charCodeAt(0)] as const;
	/** Code units of `a` and `f`. */
	static readonly HEXADECIMAL_WORD_CODE_DISTANCE = ['a'.charCodeAt(0), 'f'.charCodeAt(0)] as const;
	/** Number of ASCII characters (128). */
	static readonly ASCII_ALPHABET_SIZE = 128;

	static readonly #CAMEL_TO_KEBAB = new RegExp(
		`${LETTERS.EXTENDED.UPPERCASE}+(?![a-z])|${LETTERS.EXTENDED.UPPERCASE}`,
		'gu'
	);
	static readonly #IS_LETTER_BASIC = new RegExp(`^${LETTERS.BASIC.ALL}$`);
	static readonly #IS_LETTER_EXTENDED = new RegExp(`^${LETTERS.EXTENDED.ALL}$`, 'u');
	static readonly #IS_LOWERCASE_BASIC = new RegExp(`^${LETTERS.BASIC.LOWERCASE}$`);
	static readonly #IS_LOWERCASE_EXTENDED = new RegExp(`^${LETTERS.EXTENDED.LOWERCASE}$`, 'u');
	static readonly #IS_UPPERCASE_BASIC = new RegExp(`^${LETTERS.BASIC.UPPERCASE}$`);
	static readonly #IS_UPPERCASE_EXTENDED = new RegExp(`^${LETTERS.EXTENDED.UPPERCASE}$`, 'u');
	static readonly #IS_DIGIT_EXTENDED = new RegExp(`^${DIGITS.EXTENDED}$`, 'u');
	static readonly #IS_WHITESPACE_EXTENDED = new RegExp(`^${WHITESPACE.EXTENDED}$`, 'u');
	static readonly #IS_FORMATTING_EXTENDED = new RegExp(
		`^[${WHITESPACE.EXTENDED}\\t\\n\\v\\f\\r]$`,
		'u'
	);
	static readonly #IS_PUNCTUATION_EXTENDED = new RegExp(`^${SYMBOLS.PUNCTUATION.EXTENDED}$`, 'u');

	/** `fontSize` → `font-size`; runs of capitals stay together (`XMLHttp` → `xml-http`). */
	static toKebabCase(str: string): string {
		return str.replace(StringUtils.#CAMEL_TO_KEBAB, (match, offset) => (offset ? '-' : '') + match.toLowerCase());
	}

	/** Uppercases the first character, even when it is an emoji-sized one. */
	static capitalize<T extends string>(str: T): Capitalize<T> {
		const codePoint = str.codePointAt(0);
		if (codePoint === undefined) return str as Capitalize<T>;
		const first = String.fromCodePoint(codePoint);
		return (first.toUpperCase() + str.slice(first.length)) as Capitalize<T>;
	}

	/** Capitalizes every part of the text split by `splitStr`. */
	static capitalizeAll(str: string, splitStr: string): string {
		return str
			.split(splitStr)
			.map((strPart: string): string => StringUtils.capitalize(strPart))
			.join(splitStr);
	}

	/** Appends `padChar` until the text reaches `length`. */
	static padRight(str: string, padChar: string, length: number): string {
		return str + padChar.repeat(Math.max(0, length - str.length));
	}

	/** Prepends `padChar` until the text reaches `length`. */
	static padLeft(str: string, padChar: string, length: number): string {
		return padChar.repeat(Math.max(0, length - str.length)) + str;
	}

	/** Removes accents (`São` → `Sao`). */
	static noAccent(str: string): string {
		return str.normalize('NFD').replace(STRING_REGEX.COMBINING_MARKS, '');
	}

	/** UTF-16 code units of the text (an emoji gives two). */
	static charCodeArray(str: string): number[] {
		const len = str.length;
		const arr: number[] = new Array(len);
		for (let index = 0; index < len; index++) {
			arr[index] = str.charCodeAt(index);
		}
		return arr;
	}

	/**
	 * Whether the character can appear in a JS identifier (letter, digit, `_`, `$`). `extended` uses Unicode properties (any script); the default checks ASCII only and is faster.
	 */
	static isIdentifier(char: string, extended: boolean = false): boolean {
		return (
			StringUtils.isLetter(char, extended) ||
			StringUtils.isDigit(char, undefined, extended) ||
			char === '_' ||
			char === '$'
		);
	}

	/**
	 * Whether the character is a letter. `extended` uses Unicode properties (any script); the default checks ASCII only and is faster.
	 */
	static isLetter(char: string, extended: boolean = false): boolean {
		return extended ?
				StringUtils.#IS_LETTER_EXTENDED.test(char)
			:	StringUtils.#IS_LETTER_BASIC.test(char);
	}

	/**
	 * Whether the character is a lowercase letter. `extended` uses Unicode properties (any script); the default checks ASCII only and is faster.
	 */
	static isLowerCase(char: string, extended: boolean = false): boolean {
		return extended ?
				StringUtils.#IS_LOWERCASE_EXTENDED.test(char)
			:	StringUtils.#IS_LOWERCASE_BASIC.test(char);
	}

	/**
	 * Whether the character is an uppercase letter. `extended` uses Unicode properties (any script); the default checks ASCII only and is faster.
	 */
	static isUpperCase(char: string, extended: boolean = false): boolean {
		return extended ?
				StringUtils.#IS_UPPERCASE_EXTENDED.test(char)
			:	StringUtils.#IS_UPPERCASE_BASIC.test(char);
	}

	/**
	 * Whether every character (or only the one at `index`) is a digit. `extended` uses Unicode properties (any script); the default checks ASCII only and is faster.
	 */
	static isDigit(str: string, index?: number, extended: boolean = false): boolean {
		if (extended) {
			if (index !== undefined) return StringUtils.#IS_DIGIT_EXTENDED.test(str[index] ?? '');
			for (const char of str) {
				if (!StringUtils.#IS_DIGIT_EXTENDED.test(char)) return false;
			}
			return true;
		}
		if (index !== undefined) {
			const code = str.charCodeAt(index);
			return (
				StringUtils.DIGIT_CODE_DISTANCE[0] <= code && code <= StringUtils.DIGIT_CODE_DISTANCE[1]
			);
		}
		const len = str.length;
		for (let i = 0; i < len; i++) {
			const code = str.charCodeAt(i);
			if (StringUtils.DIGIT_CODE_DISTANCE[0] > code || code > StringUtils.DIGIT_CODE_DISTANCE[1])
				return false;
		}
		return true;
	}

	/**
	 * Whether the character is a letter or a digit. `extended` uses Unicode properties (any script); the default checks ASCII only and is faster.
	 */
	static isLetterOrDigit(char: string, extended: boolean = false): boolean {
		return StringUtils.isLetter(char, extended) || StringUtils.isDigit(char, undefined, extended);
	}

	/** Whether the text is not empty and every character is a hexadecimal digit (`0-9`, `a-f`, `A-F`). */
	static isHexadecimal(str: string): boolean {
		const len = str.length;
		if (len === 0) return false;
		const lower = str.toLowerCase();
		for (let index = 0; index < len; index++) {
			const code = lower.charCodeAt(index);
			const notWordHex =
				StringUtils.HEXADECIMAL_WORD_CODE_DISTANCE[0] > code ||
				code > StringUtils.HEXADECIMAL_WORD_CODE_DISTANCE[1];
			const notDigitHex =
				StringUtils.DIGIT_CODE_DISTANCE[0] > code || code > StringUtils.DIGIT_CODE_DISTANCE[1];
			if (notWordHex && notDigitHex) return false;
		}
		return true;
	}

	/**
	 * Whether the character is whitespace or a control formatting character (tab, line breaks). `extended` uses Unicode properties (any script); the default checks ASCII only and is faster.
	 */
	static isFormatting(char: string, extended: boolean = false): boolean {
		if (extended) return StringUtils.#IS_FORMATTING_EXTENDED.test(char);
		const code = char.charCodeAt(0);
		return (
			code === StringUtils.WHITESPACE_CODE ||
			(code >= StringUtils.FORMAT_CODE_DISTANCE[0] && code <= StringUtils.FORMAT_CODE_DISTANCE[1])
		);
	}

	/**
	 * Whether the character is whitespace. `extended` uses Unicode properties (any script); the default checks ASCII only and is faster.
	 */
	static isWhitespace(char: string, extended: boolean = false): boolean {
		if (extended) return StringUtils.#IS_WHITESPACE_EXTENDED.test(char);
		const code = char.charCodeAt(0);
		return (
			StringUtils.WHITESPACE_CODE === code ||
			StringUtils.NEWLINE_CODE === code ||
			StringUtils.CARRIAGE_RETURN_CODE === code ||
			StringUtils.TAB_CODE === code
		);
	}

	/** Whether the character is `\n` or `\r`. */
	static isLineBreak(char: string): boolean {
		const code = char.charCodeAt(0);
		return code === StringUtils.NEWLINE_CODE || code === StringUtils.CARRIAGE_RETURN_CODE;
	}

	/** Whether the character is a tab. */
	static isTab(char: string): boolean {
		return char.charCodeAt(0) === StringUtils.TAB_CODE;
	}

	/** Whether the character is `\r`. */
	static isCarriageReturn(char: string): boolean {
		return char.charCodeAt(0) === StringUtils.CARRIAGE_RETURN_CODE;
	}

	/** Whether the character is a form feed. */
	static isFormFeed(char: string): boolean {
		return char.charCodeAt(0) === StringUtils.FORM_FEED_CODE;
	}

	/** Whether the character is a vertical tab. */
	static isVerticalTab(char: string): boolean {
		return char.charCodeAt(0) === StringUtils.VERTICAL_TAB_CODE;
	}

	/** Whether the character is `+`, `-`, `*`, `/`, `%` or `^`. */
	static isMathOperator(char: string): boolean {
		switch (char) {
			case '+':
			case '-':
			case '*':
			case '/':
			case '%':
			case '^':
				return true;
			default:
				return false;
		}
	}

	/** Whether the character is `<`, `>`, `=` or `!`. */
	static isRelationalOperator(char: string): boolean {
		switch (char) {
			case '>':
			case '<':
			case '=':
			case '!':
				return true;
			default:
				return false;
		}
	}

	/** Whether the character is `&`, `|`, `^` or `~`. */
	static isBitwireOperator(char: string): boolean {
		switch (char) {
			case '&':
			case '|':
			case '^':
			case '~':
				return true;
			default:
				return false;
		}
	}

	/**
	 * Whether the character is punctuation. `extended` uses Unicode properties (any script); the default checks ASCII only and is faster.
	 */
	static isPunctuation(char: string, extended: boolean = false): boolean {
		if (extended) return StringUtils.#IS_PUNCTUATION_EXTENDED.test(char);
		switch (char) {
			case '.':
			case ',':
			case ';':
			case ':':
			case '?':
			case '!':
			case '(':
			case ')':
			case '[':
			case ']':
			case '{':
			case '}':
			case '"':
			case "'":
			case '`':
			case '-':
			case '_':
			case '/':
			case '\\':
			case '@':
			case '#':
				return true;
			default:
				return false;
		}
	}

	/**
	 * Whether the character is a symbol (math, currency, emoji...). `extended` uses Unicode properties (any script); the default checks ASCII only and is faster.
	 */
	static isSymbol(char: string, extended: boolean = false): boolean {
		return (
			!StringUtils.isLetter(char, extended) &&
			!StringUtils.isDigit(char, undefined, extended) &&
			!StringUtils.isWhitespace(char, extended) &&
			!StringUtils.isLineBreak(char) &&
			!StringUtils.isTab(char)
		);
	}

	/** Whether the character is a backslash. */
	static isEscape(char: string): char is '\\' {
		return char.charCodeAt(0) === StringUtils.ESCAPE_CODE;
	}

	/**
	 * Calls `callback` for each character, emoji and joined sequences counting as one; `size` is its length in UTF-16 units.
	 */
	static forEach(str: string, callback: TStrForEeachCallback) {
		if (!RegexUtils.hasAstralChar(str)) {
			const len = str.length;
			for (let index = 0; index < len; index++) {
				callback(str[index], index, 1);
			}
			return;
		}
		for (const { segment, index } of StringUtils.#SEGMENTER.segment(str)) {
			callback(segment, index, segment.length);
		}
	}

	/**
	 * Prepares a fast search for the given characters. The returned function calls `callback(index, size)` for each occurrence in a text.
	 */
	static onChar(chars: string) {
		const bmpTargets: string[] = [];
		let astralTargets: Set<string> | undefined;

		for (const { segment } of StringUtils.#SEGMENTER.segment(chars)) {
			if (segment.length === 1) {
				bmpTargets.push(segment);
			} else {
				(astralTargets ??= new Set()).add(segment);
			}
		}

		const lookup = StringUtils.lookupArray(bmpTargets.join(''));
		const highestCode = lookup.length - 1;

		return function (str: string, callback: TStrOnCharCallback) {
			if (!RegexUtils.hasAstralChar(str)) {
				const len = str.length;
				for (let i = 0; i < len; i++) {
					const code = str.charCodeAt(i);
					if (code > highestCode || lookup[code] === 0) continue;
					callback(i, 1);
				}
				return;
			}

			for (const { segment, index } of StringUtils.#SEGMENTER.segment(str)) {
				const size = segment.length;
				if (size === 1) {
					const code = segment.charCodeAt(0);
					if (code > highestCode || lookup[code] === 0) continue;
				} else if (!astralTargets?.has(segment)) {
					continue;
				}
				callback(index, size);
			}
		};
	}

	/** Table indexed by code unit with 1 for each character of `chars` (sized to the largest code unit). */
	static lookupArray(chars: string) {
		let highestCode = 0;
		const cLen = chars.length;
		for (let i = 0; i < cLen; i++) {
			const code = chars.charCodeAt(i);
			if (code > highestCode) highestCode = code;
		}
		const lookup = new Uint8Array(highestCode + 1);
		for (let i = 0; i < cLen; i++) lookup[chars.charCodeAt(i)] = 1;
		return lookup;
	}

	/** Same as `lookupArray`, fixed to the ASCII range. */
	static lookupArray128(chars: string) {
		const lookup = new Uint8Array(128);
		const cLen = chars.length;
		for (let i = 0; i < cLen; i++) lookup[chars.charCodeAt(i)] = 1;
		return lookup;
	}

	/** Lowercase, accent-free, hyphen-separated text for URLs (`Olá Mundo!` → `ola-mundo`). */
	static slugify(text: string): string {
		return text
			.normalize('NFD')
			.replace(STRING_REGEX.COMBINING_MARKS, '')
			.toLowerCase()
			.trim()
			.replace(STRING_REGEX.NON_SLUG_CHARACTERS, '')
			.replace(STRING_REGEX.WHITESPACE_RUNS, '-')
			.replace(STRING_REGEX.HYPHEN_RUNS, '-');
	}

	/** Cuts the text to `length` and appends `...`, at a word boundary unless `preserveWords` is false. */
	static truncate(text: string, length: number, preserveWords = true): string {
		if (text.length <= length) return text;
		if (!preserveWords) return `${text.slice(0, length)}...`;

		const truncated = text.slice(0, length);
		const lastSpace = truncated.lastIndexOf(' ');
		return `${truncated.slice(0, lastSpace > 0 ? lastSpace : length)}...`;
	}

	/** Uppercases the first letter of each word. */
	static capitalizeWords(text: string): string {
		return text.replace(STRING_REGEX.WORD_START, (char) => char.toUpperCase());
	}

	/** `fontSize` → `font_size`. */
	static toSnakeCase(text: string): string {
		return text
			.replace(STRING_REGEX.LOWER_UPPER_BOUNDARY, '$1_$2')
			.replace(STRING_REGEX.WORD_SEPARATOR_RUNS, '_')
			.toLowerCase();
	}
}

/** Type of the `StringUtils` class (used to type the `String.prototype` extensions). */
type TUString = typeof StringUtils;

export { StringUtils, TUString };
