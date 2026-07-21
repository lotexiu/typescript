
/**
 * @internal
*/
class _String {
	static toKebabCase(str: string): string {
		return str.replace(
			/[A-Z]+(?![a-z])|[A-Z]/g,
			($, ofs) => (ofs ? "-" : "") + $.toLowerCase(),
		);
	}
	
	static capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
	
	static capitalizeAll(str: string, splitStr: string): string {
		return str
			.split(splitStr)
			.map((strPart: string): string => _String.capitalize(strPart))
			.join(splitStr);
	}
	
	static rightPad(str: string, padChar: string, length: number): string {
		return str + padChar.repeat(length - str.length);
	}
	
	static leftPad(str: string, padChar: string, length: number): string {
		return padChar.repeat(length - str.length) + str;
	}
	
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
	
	static removeCharacters(baseString: string, charsToRemove: string): string {
		return baseString
			.split("")
			.filter((char) => !charsToRemove.includes(char))
			.join("");
	}
	
	static noAccent(str: string): string {
		return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	}
	
	static stringToCharCodeArray(str: string): string[] {
		return str.split("").map((char: string): string => {
			return char.charCodeAt(0).toString(16);
		});
	}
	
	static isIdentifier(char: string): boolean {
		return (
			_String.isLetter(char) ||
			_String.isDigit(char) ||
			char === '_' ||
			char === '$'
		);
	}
	
	static isLetter(char: string): boolean {
		return char.toLowerCase() !== char.toUpperCase();
	}
	
	static isLowerCase(char: string): boolean {
		return char === char.toLowerCase() && _String.isLetter(char);
	}
	
	static isUpperCase(char: string): boolean {
		return char === char.toUpperCase() && _String.isLetter(char);
	}
	
	static isDigit(char: string): boolean {
		return char >= "0" && char <= "9";
	}
	
	static isLetterOrDigit(char: string): boolean {
		return _String.isLetter(char) || _String.isDigit(char);
	}
	
	static isHexadecimal(char: string): boolean {
		return (
			_String.isDigit(char) ||
			(char.toLowerCase() >= "a" && char.toLowerCase() <= "f")
		);
	}
	
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
	
	static isWhitespace(char: string): boolean {
		return char == ' '
	}
	
	static isLineBreak(char: string): boolean {
		return char == '\n' || _String.isCarriageReturn(char);
	}
	
	static isTab(char: string): boolean {
		return char == '\t';
	}
	
	static isCarriageReturn(char: string): boolean {
		return char == '\r';
	}
	
	static isFormFeed(char: string): boolean {
		return char == '\f';
	}
	
	static isVerticalTab(char: string): boolean {
		return char == '\v';
	}
	
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
	
	static isRelationalOperator(char: string): boolean {
		switch (char) {
			case '>':case '<':
			case '=':case '!':
				return true;
			default:
				return false;
		}
	}
	
	static isBitwireOperator(char: string): boolean {
		switch (char) {
			case '&':case '|':
			case '^':case '~':
				return true;
			default:
				return false;
		}
	}
	
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
	
	static isSymbol(char: string): boolean {
		return (
			!_String.isLetter(char) &&
			!_String.isDigit(char) &&
			!_String.isWhitespace(char) &&
			!_String.isLineBreak(char) &&
			!_String.isTab(char)
		)
	}
	
	static isEscape(char: string): boolean {
		return char === '\\';
	}
};

/** The static shape of the internal `_String` implementation. */
type TUString = typeof _String;


export {
	_String,
	TUString
}