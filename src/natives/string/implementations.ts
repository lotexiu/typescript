
/**
 * @internal
*/
class _String {
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
	static rightPad(str: string, padChar: string, length: number): string {
		return str + padChar.repeat(length - str.length);
	}

	/** Pads `str` on the left with `padChar` up to `length` total characters. */
	static leftPad(str: string, padChar: string, length: number): string {
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
	static stringToCharCodeArray(str: string): string[] {
		return str.split("").map((char: string): string => {
			return char.charCodeAt(0).toString(16);
		});
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
		return char === char.toLowerCase() && _String.isLetter(char);
	}

	/** True for an uppercase letter. */
	static isUpperCase(char: string): boolean {
		return char === char.toUpperCase() && _String.isLetter(char);
	}

	/** True for `0`-`9`. */
	static isDigit(char: string): boolean {
		return char >= "0" && char <= "9";
	}

	/** True for a letter or a digit. */
	static isLetterOrDigit(char: string): boolean {
		return _String.isLetter(char) || _String.isDigit(char);
	}

	/** True for a digit or an `a`-`f`/`A`-`F` hex letter. */
	static isHexadecimal(char: string): boolean {
		return (
			_String.isDigit(char) ||
			(char.toLowerCase() >= "a" && char.toLowerCase() <= "f")
		);
	}

	/** True for whitespace, a line break, tab, carriage return, form feed, or vertical tab. */
	static isFormatting(char: string): boolean {
		return (
			_String.isWhitespace(char) ||
			_String.isLineBreak(char) ||
			_String.isTab(char) ||
			_String.isCarriageReturn(char) ||
			_String.isFormFeed(char) ||
			_String.isVerticalTab(char)
		);
	}
	
	/** True for a plain space character. */
	static isWhitespace(char: string): boolean {
		return char == ' '
	}

	/** True for `\n` or a carriage return. */
	static isLineBreak(char: string): boolean {
		return char == '\n' || _String.isCarriageReturn(char);
	}

	/** True for `\t`. */
	static isTab(char: string): boolean {
		return char == '\t';
	}

	/** True for `\r`. */
	static isCarriageReturn(char: string): boolean {
		return char == '\r';
	}

	/** True for `\f`. */
	static isFormFeed(char: string): boolean {
		return char == '\f';
	}

	/** True for `\v`. */
	static isVerticalTab(char: string): boolean {
		return char == '\v';
	}

	/** True for `+ - * / % ^`. */
	static isMathOperator(char: string): boolean {
		switch (char) {
			case '+':case '-':
			case '*':case '/':
			case '%':case '^':
				return true;
			default:
				return false;
		}
	}
	
	/** True for `> < = !`. */
	static isRelationalOperator(char: string): boolean {
		switch (char) {
			case '>':case '<':
			case '=':case '!':
				return true;
			default:
				return false;
		}
	}

	/** True for `& | ^ ~`. */
	static isBitwireOperator(char: string): boolean {
		switch (char) {
			case '&':case '|':
			case '^':case '~':
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
		return char === '\\';
	}
};


export {
	_String,
}