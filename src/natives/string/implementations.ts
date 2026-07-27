
/**
 * @internal
*/
class _String {
	static readonly WHITESPACE_CODE = " ".charCodeAt(0);
	static readonly ESCAPE_CODE = "\\".charCodeAt(0);
	static readonly TAB_CODE = "\t".charCodeAt(0);
	static readonly NEWLINE_CODE = "\n".charCodeAt(0);
	static readonly VERTICAL_TAB_CODE = "\v".charCodeAt(0);
	static readonly FORM_FEED_CODE = "\f".charCodeAt(0);
	static readonly CARRIAGE_RETURN_CODE = "\r".charCodeAt(0);
	static readonly FORMAT_CODE_DISTANCE = [_String.TAB_CODE, _String.CARRIAGE_RETURN_CODE] as const;
	static readonly DIGIT_CODE_DISTANCE = ["0".charCodeAt(0), "9".charCodeAt(0)] as const;
	static readonly HEXADECIMAL_WORD_CODE_DISTANCE = ["a".charCodeAt(0), "f".charCodeAt(0)] as const;

	/** Converts `camelCase`/`PascalCase` to `kebab-case`. */
	static toKebabCase(str: string): string {
		return str.replace(
			/[A-Z]+(?![a-z])|[A-Z]/g,
			($, ofs) => (ofs ? "-" : "") + $.toLowerCase(),
		);
	}

	/** Uppercases the first character, leaves the rest untouched. */
	static capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	/** Splits `str` on `splitStr` and capitalizes every resulting segment. */
	static capitalizeAll(str: string, splitStr: string): string {
		return str
			.split(splitStr)
			.map((strPart: string): string => _String.capitalize(strPart))
			.join(splitStr);
	}

	/** Pads `str` on the right with `padChar` up to `length` total characters. */
	static padRight(str: string, padChar: string, length: number): string {
		return str + padChar.repeat(length - str.length);
	}

	/** Pads `str` on the left with `padChar` up to `length` total characters. */
	static padLeft(str: string, padChar: string, length: number): string {
		return padChar.repeat(length - str.length) + str;
	}

	/** Index of the first character where `str1` and `str2` differ, or `defaultValue` if they never do. */
	static getFirstDifferentIndex(
		str1: string,
		str2: string,
		defaultValue: number = -1,
	): number {
		let index: number = [...str1].findIndex((char, index) => {
			return str2[index] !== char;
		});
		return index === -1 ? defaultValue : index;
	}

	/** Index of the last character (counting from the end) where `str1` and `str2` differ, or `defaultValue` if they never do. */
	static getLastDifferentIndex(
		str1: string,
		str2: string,
		defaultValue: number = -1,
	): number {
		return _String.getFirstDifferentIndex(
			[...str1].reverse().join(""),
			[...str2].reverse().join(""),
			defaultValue,
		);
	}

	/** Removes every character in `charsToRemove` from `baseString`. */
	static removeCharacters(baseString: string, charsToRemove: string): string {
		return baseString
			.split("")
			.filter((char) => !charsToRemove.includes(char))
			.join("");
	}

	/** Strips diacritics (accents) from `str` via Unicode normalization. */
	static noAccent(str: string): string {
		return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	}

	/** Maps each character of `str` to its hex char code. */
	static charCodeArray(str: string): Array<number> {
		const len = str.length;
		const arr = new Array(len);
		for (let index = 0; index < len; index++) {
			arr[index] = str.charCodeAt(index);
		}
		return arr;
	}

	/** True for a character valid in a JS identifier (letter, digit, `_`, or `$`). */
	static isIdentifier(char: string): boolean {
		return (
			_String.isLetter(char) ||
			_String.isDigit(char) ||
			char === '_' ||
			char === '$'
		);
	}

	/** True for any alphabetic character (case-insensitively distinguishable from itself). */
	static isLetter(char: string): boolean {
		return char.toLowerCase() !== char.toUpperCase();
	}

	/** True for a lowercase letter. */
	static isLowerCase(char: string): boolean {
		return _String.isLetter(char) && char === char.toLowerCase();
	}

	/** True for an uppercase letter. */
	static isUpperCase(char: string): boolean {
		return _String.isLetter(char) && char === char.toUpperCase();
	}

	/**
	 * Validate if the string or character is a digit
	 * @param str String to check
	 * @param index if index is provided, it will check if the character at the index is a digit
	 * @returns `TRUE` for a digit and `FALSE` if not
	 */
	static isDigit(str: string, index?: number): boolean {
		if (index) {
			const code = str.charCodeAt(0);
			return _String.DIGIT_CODE_DISTANCE[0] <= code && code <= _String.DIGIT_CODE_DISTANCE[1];
		}
		const len = str.length;
		for (let index = 0; index < len; index++) {
			const code = str.charCodeAt(index)
			if (_String.DIGIT_CODE_DISTANCE[0] > code || code > _String.DIGIT_CODE_DISTANCE[1]) return false;
		}
		return true;
	}

	/** True for a letter or a digit. */
	static isLetterOrDigit(char: string): boolean {
		return _String.isLetter(char) || _String.isDigit(char);
	}

	/**
	 * Validate if the string is a hexadecimal
	 * @param str String to check
	 * @returns `TRUE` if the string is a hexadecimal and `FALSE` if not
	 */
	static isHexadecimal(str: string): boolean {
		const len = str.length;
		if (len > 4 && len % 2) return false;
		for (let index = 0; index < len; index++) {
			const code = str.charCodeAt(index);
			const notWordHex = _String.HEXADECIMAL_WORD_CODE_DISTANCE[0] > code || code > _String.HEXADECIMAL_WORD_CODE_DISTANCE[1]
			const notDigitHex = _String.DIGIT_CODE_DISTANCE[0] > code || code > _String.DIGIT_CODE_DISTANCE[1]
			if (notWordHex && notDigitHex) return false;
		}
		return true;
	}

	/** True for whitespace, a line break, tab, carriage return, form feed, or vertical tab. */
	static isFormatting(char: string): boolean {
		const code = char.charCodeAt(0);
		return code >= _String.FORMAT_CODE_DISTANCE[0] && code <= _String.FORMAT_CODE_DISTANCE[1];
	}

	/** True for a plain space character. */
	static isWhitespace(char: string): boolean {
		return char.charCodeAt(0) === _String.WHITESPACE_CODE;
	}

	/** True for `\n` or a carriage return. */
	static isLineBreak(char: string): boolean {
		const code = char.charCodeAt(0);
		return code == _String.NEWLINE_CODE || code == _String.CARRIAGE_RETURN_CODE;
	}

	/** True for `\t`. */
	static isTab(char: string): boolean {
		return char.charCodeAt(0) == _String.TAB_CODE;
	}

	/** True for `\r`. */
	static isCarriageReturn(char: string): boolean {
		return char.charCodeAt(0) == _String.CARRIAGE_RETURN_CODE;
	}

	/** True for `\f`. */
	static isFormFeed(char: string): boolean {
		return char.charCodeAt(0) == _String.FORM_FEED_CODE;
	}

	/** True for `\v`. */
	static isVerticalTab(char: string): boolean {
		return char.charCodeAt(0) == _String.VERTICAL_TAB_CODE;
	}

	/** True for `+ - * / % ^`. */
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

	/** True for `> < = !`. */
	static isRelationalOperator(char: string): boolean {
		switch (char) {
			case '>': case '<':
			case '=': case '!':
				return true;
			default:
				return false;
		}
	}

	/** True for `& | ^ ~`. */
	static isBitwireOperator(char: string): boolean {
		switch (char) {
			case '&': case '|':
			case '^': case '~':
				return true;
			default:
				return false;
		}
	}

	/** True for common punctuation/bracket/quote characters. */
	static isPunctuation(char: string): boolean {
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

	/** True for a character that's none of letter, digit, whitespace, line break, or tab. */
	static isSymbol(char: string): boolean {
		return (
			!_String.isLetter(char) &&
			!_String.isDigit(char) &&
			!_String.isWhitespace(char) &&
			!_String.isLineBreak(char) &&
			!_String.isTab(char)
		)
	}

	/** True for `\`. */
	static isEscape(char: string): boolean {
		return char.charCodeAt(0) == _String.ESCAPE_CODE;
	}

	/**
	 * Iterate over each character in a string.
	 * @param str - The string to iterate over.
	 * @param callback - The callback to call for each character. If it returns `false`, iteration stops.
	 */
	static forEach(str: string, callback: (char: string, index: number) => void | false) {
		const len = str.length;
		for (let index = 0; index < len; index++) {
			if (callback(str[index], index) === false) break;
		}
	}

	/**
	 * Create a function that iterates over each character in a string, calling a callback for each character that is in the given set.
	 * @param chars - The set of characters to iterate over.
	 * @returns A function that iterates over each character in a string, calling a callback for each character that is in the given set.
	 */
	static onChar(chars: string) {
		let highestCode = 0
		const cLen = chars.length
		for (let i = 0; i < cLen; i++) {
			const code = chars.charCodeAt(i)
			if (code > highestCode) highestCode = code
		}
		const lookup = new Uint8Array(highestCode + 1)
		for (let i = 0; i < cLen; i++) lookup[chars.charCodeAt(i)] = 1

		return function (str: string, callback: (char: string, index: number) => void | false) {
			const len = str.length
			for (let i = 0; i < len; i++) {
				const code = str.charCodeAt(i)
				if (code > highestCode || lookup[code] === 0) continue
				if (callback(str[i], i) === false) break
			}
		}
	}
};

export {
	_String,
}