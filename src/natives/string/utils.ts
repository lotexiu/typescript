import { REGEX_PATTERNS } from "@tsn/regex/declarations";
import { TStrForEeachCallback, TStrOnCharCallback } from "./types";
import { _Regex } from "@tsn/regex/implementations";

const { LETTERS, DIGITS, WHITESPACE, SYMBOLS } = REGEX_PATTERNS

/**
 * @internal
*/
class StringUtils {
	private static readonly SEGMENTER = new Intl.Segmenter();
	static readonly WHITESPACE_CODE = " ".charCodeAt(0);
	static readonly ESCAPE_CODE = "\\".charCodeAt(0);
	static readonly TAB_CODE = "\t".charCodeAt(0);
	static readonly NEWLINE_CODE = "\n".charCodeAt(0);
	static readonly VERTICAL_TAB_CODE = "\v".charCodeAt(0);
	static readonly FORM_FEED_CODE = "\f".charCodeAt(0);
	static readonly CARRIAGE_RETURN_CODE = "\r".charCodeAt(0);
	static readonly FORMAT_CODE_DISTANCE = [StringUtils.TAB_CODE, StringUtils.CARRIAGE_RETURN_CODE] as const;
	static readonly DIGIT_CODE_DISTANCE = ["0".charCodeAt(0), "9".charCodeAt(0)] as const;
	static readonly HEXADECIMAL_WORD_CODE_DISTANCE = ["a".charCodeAt(0), "f".charCodeAt(0)] as const;
	private static readonly CAMEL_TO_KEBAB = new RegExp(`${LETTERS.EXTENDED.UPPERCASE}+(?![a-z])|${LETTERS.EXTENDED.UPPERCASE}`, "gu")

	private static readonly IS_LETTER_BASIC = new RegExp(`^${LETTERS.BASIC.ALL}$`);
	private static readonly IS_LETTER_EXTENDED = new RegExp(`^${LETTERS.EXTENDED.ALL}$`, "u");
	private static readonly IS_LOWERCASE_BASIC = new RegExp(`^${LETTERS.BASIC.LOWERCASE}$`);
	private static readonly IS_LOWERCASE_EXTENDED = new RegExp(`^${LETTERS.EXTENDED.LOWERCASE}$`, "u");
	private static readonly IS_UPPERCASE_BASIC = new RegExp(`^${LETTERS.BASIC.UPPERCASE}$`);
	private static readonly IS_UPPERCASE_EXTENDED = new RegExp(`^${LETTERS.EXTENDED.UPPERCASE}$`, "u");
	private static readonly IS_DIGIT_EXTENDED = new RegExp(`^${DIGITS.EXTENDED}$`, "u");
	private static readonly IS_WHITESPACE_EXTENDED = new RegExp(`^${WHITESPACE.EXTENDED}$`, "u");
	private static readonly IS_FORMATTING_EXTENDED = new RegExp(`^[${WHITESPACE.EXTENDED}\\t\\n\\v\\f\\r]$`, "u");
	private static readonly IS_PUNCTUATION_EXTENDED = new RegExp(`^${SYMBOLS.PUNCTUATION.EXTENDED}$`, "u");

	static toKebabCase(str: string): string {
		return str.replace(StringUtils.CAMEL_TO_KEBAB, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase());
	}

	static capitalize<T extends string>(str: T): Capitalize<T> {
		const codePoint = str.codePointAt(0);
		if (codePoint === undefined) return str as Capitalize<T>;
		const first = String.fromCodePoint(codePoint);
		return first.toUpperCase() + str.slice(first.length) as Capitalize<T>;
	}

	static capitalizeAll(str: string, splitStr: string): string {
		return str
			.split(splitStr)
			.map((strPart: string): string => StringUtils.capitalize(strPart))
			.join(splitStr);
	}

	static padRight(str: string, padChar: string, length: number): string {
		return str + padChar.repeat(length - str.length);
	}

	static padLeft(str: string, padChar: string, length: number): string {
		return padChar.repeat(length - str.length) + str;
	}

	static noAccent(str: string): string {
		return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	}

	static charCodeArray(str: string): Array<string> {
		const len = str.length;
		const arr = new Array(len);
		for (let index = 0; index < len; index++) {
			arr[index] = str.charCodeAt(index);
		}
		return arr;
	}

	static isIdentifier(char: string, extended: boolean = false): boolean {
		return (
			StringUtils.isLetter(char, extended) ||
			StringUtils.isDigit(char, undefined, extended) ||
			char === '_' ||
			char === '$'
		);
	}

	static isLetter(char: string, extended: boolean = false): boolean {
		return extended
			? StringUtils.IS_LETTER_EXTENDED.test(char)
			: StringUtils.IS_LETTER_BASIC.test(char);
	}

	static isLowerCase(char: string, extended: boolean = false): boolean {
		return extended
			? StringUtils.IS_LOWERCASE_EXTENDED.test(char)
			: StringUtils.IS_LOWERCASE_BASIC.test(char);
	}

	static isUpperCase(char: string, extended: boolean = false): boolean {
		return extended
			? StringUtils.IS_UPPERCASE_EXTENDED.test(char)
			: StringUtils.IS_UPPERCASE_BASIC.test(char);
	}

	static isDigit(str: string, index?: number, extended: boolean = false): boolean {
		if (extended) {
			if (index !== undefined) return StringUtils.IS_DIGIT_EXTENDED.test(str[index] ?? '');
			for (const char of str) {
				if (!StringUtils.IS_DIGIT_EXTENDED.test(char)) return false;
			}
			return true;
		}
		if (index !== undefined) {
			const code = str.charCodeAt(index);
			return StringUtils.DIGIT_CODE_DISTANCE[0] <= code && code <= StringUtils.DIGIT_CODE_DISTANCE[1];
		}
		const len = str.length;
		for (let i = 0; i < len; i++) {
			const code = str.charCodeAt(i);
			if (StringUtils.DIGIT_CODE_DISTANCE[0] > code || code > StringUtils.DIGIT_CODE_DISTANCE[1]) return false;
		}
		return true;
	}

	static isLetterOrDigit(char: string, extended: boolean = false): boolean {
		return StringUtils.isLetter(char, extended) || StringUtils.isDigit(char, undefined, extended);
	}

	static isHexadecimal(str: string): boolean {
		const len = str.length;
		if (len > 4 && len % 2) return false;
		const lower = str.toLowerCase();
		for (let index = 0; index < len; index++) {
			const code = lower.charCodeAt(index);
			const notWordHex = StringUtils.HEXADECIMAL_WORD_CODE_DISTANCE[0] > code || code > StringUtils.HEXADECIMAL_WORD_CODE_DISTANCE[1]
			const notDigitHex = StringUtils.DIGIT_CODE_DISTANCE[0] > code || code > StringUtils.DIGIT_CODE_DISTANCE[1]
			if (notWordHex && notDigitHex) return false;
		}
		return true;
	}

	static isFormatting(char: string, extended: boolean = false): boolean {
		if (extended) return StringUtils.IS_FORMATTING_EXTENDED.test(char);
		const code = char.charCodeAt(0);
		return code === StringUtils.WHITESPACE_CODE || (code >= StringUtils.FORMAT_CODE_DISTANCE[0] && code <= StringUtils.FORMAT_CODE_DISTANCE[1]);
	}

	static isWhitespace(char: string, extended: boolean = false): boolean {
		if (extended) return StringUtils.IS_WHITESPACE_EXTENDED.test(char);
		const code = char.charCodeAt(0)
		return (
			StringUtils.WHITESPACE_CODE === code ||
			StringUtils.NEWLINE_CODE === code ||
			StringUtils.CARRIAGE_RETURN_CODE === code ||
			StringUtils.TAB_CODE === code
		)
	}

	static isLineBreak(char: string): boolean {
		const code = char.charCodeAt(0);
		return code == StringUtils.NEWLINE_CODE || code == StringUtils.CARRIAGE_RETURN_CODE;
	}

	static isTab(char: string): boolean {
		return char.charCodeAt(0) == StringUtils.TAB_CODE;
	}

	static isCarriageReturn(char: string): boolean {
		return char.charCodeAt(0) == StringUtils.CARRIAGE_RETURN_CODE;
	}

	static isFormFeed(char: string): boolean {
		return char.charCodeAt(0) == StringUtils.FORM_FEED_CODE;
	}

	static isVerticalTab(char: string): boolean {
		return char.charCodeAt(0) == StringUtils.VERTICAL_TAB_CODE;
	}

	static isMathOperator(char: string): boolean {
		switch (char) {
			case '+': case '-':
			case '*': case '/':
			case '%': case '^':
				return true;
			default:
				return false;
		}
	}

	static isRelationalOperator(char: string): boolean {
		switch (char) {
			case '>': case '<':
			case '=': case '!':
				return true;
			default:
				return false;
		}
	}

	static isBitwireOperator(char: string): boolean {
		switch (char) {
			case '&': case '|':
			case '^': case '~':
				return true;
			default:
				return false;
		}
	}

	static isPunctuation(char: string, extended: boolean = false): boolean {
		if (extended) return StringUtils.IS_PUNCTUATION_EXTENDED.test(char);
		switch (char) {
			case '.': case ',':
			case ';': case ':':
			case '?': case '!':
			case '(': case ')':
			case '[': case ']':
			case '{': case '}':
			case '"': case "'":
			case '`':
			case '-': case '_':
			case '/': case '\\':
			case '@': case '#':
				return true;
			default:
				return false;
		}
	}

	static isSymbol(char: string, extended: boolean = false): boolean {
		return (
			!StringUtils.isLetter(char, extended) &&
			!StringUtils.isDigit(char, undefined, extended) &&
			!StringUtils.isWhitespace(char, extended) &&
			!StringUtils.isLineBreak(char) &&
			!StringUtils.isTab(char)
		)
	}

	static isEscape(char: string): char is "\\" {
		return char.charCodeAt(0) == StringUtils.ESCAPE_CODE;
	}

	static forEach(str: string, callback: TStrForEeachCallback) {
		if (!_Regex.hasAstralChar(str)) {
			const len = str.length;
			for (let index = 0; index < len; index++) {
				callback(str[index], index, 1);
			}
			return;
		}
		for (const {segment, index} of StringUtils.SEGMENTER.segment(str)) {
			callback(segment, index, segment.length);
		}
	}

	static onChar(chars: string) {
		const bmpTargets: string[] = []
		let astralTargets: Set<string> | undefined

		for (const { segment } of StringUtils.SEGMENTER.segment(chars)) {
			if (segment.length === 1) {
				bmpTargets.push(segment)
			} else {
				(astralTargets ??= new Set()).add(segment)
			}
		}

		const lookup = StringUtils.lookupArray(bmpTargets.join(''))
		const highestCode = lookup.length - 1

		return function (str: string, callback: TStrOnCharCallback) {
			if (!_Regex.hasAstralChar(str)) {
				const len = str.length
				for (let i = 0; i < len; i++) {
					const code = str.charCodeAt(i)
					if (code > highestCode || lookup[code] === 0) continue
					callback(i, 1);
				}
				return
			}

			for (const { segment, index } of StringUtils.SEGMENTER.segment(str)) {
				const size = segment.length
				if (size === 1) {
					const code = segment.charCodeAt(0)
					if (code > highestCode || lookup[code] === 0) continue
				} else if (!astralTargets?.has(segment)) {
					continue
				}
				callback(index, size);
			}
		}
	}

	static lookupArray(chars: string) {
		let highestCode = 0
		const cLen = chars.length
		for (let i = 0; i < cLen; i++) {
			const code = chars.charCodeAt(i)
			if (code > highestCode) highestCode = code
		}
		const lookup = new Uint8Array(highestCode + 1)
		for (let i = 0; i < cLen; i++) lookup[chars.charCodeAt(i)] = 1
		return lookup
	}

	static lookupArray128(chars: string) {
		const lookup = new Uint8Array(128)
		const cLen = chars.length
		for (let i = 0; i < cLen; i++) lookup[chars.charCodeAt(i)] = 1
		return lookup
	}
};

type TUString = typeof StringUtils;

export {
	StringUtils,
	TUString,
}