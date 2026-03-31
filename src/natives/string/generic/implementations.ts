function toKebabCase(str: string): string {
	return str.replace(
		/[A-Z]+(?![a-z])|[A-Z]/g,
		($, ofs) => (ofs ? "-" : "") + $.toLowerCase(),
	);
}

function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function capitalizeAll(str: string, splitStr: string): string {
	return str
		.split(splitStr)
		.map((strPart: string): string => capitalize(strPart))
		.join(splitStr);
}

function rightPad(str: string, padChar: string, length: number): string {
	return str + padChar.repeat(length - str.length);
}

function leftPad(str: string, padChar: string, length: number): string {
	return padChar.repeat(length - str.length) + str;
}

function getFirstDifferentIndex(
	str1: string,
	str2: string,
	defaultValue: number = -1,
): number {
	let index: number = [...str1].findIndex((char, index) => {
		return str2[index] !== char;
	});
	return index === -1 ? defaultValue : index;
}

function getLastDifferentIndex(
	str1: string,
	str2: string,
	defaultValue: number = -1,
): number {
	return getFirstDifferentIndex(
		[...str1].reverse().join(""),
		[...str2].reverse().join(""),
		defaultValue,
	);
}

function removeCharacters(baseString: string, charsToRemove: string): string {
	return baseString
		.split("")
		.filter((char) => !charsToRemove.includes(char))
		.join("");
}

function noAccent(str: string): string {
	return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function stringToCharCodeArray(str: string): string[] {
	return str.split("").map((char: string): string => {
		return char.charCodeAt(0).toString(16);
	});
}

function isIdentifier(char: string): boolean {
	return (
		isLetter(char) ||
		isDigit(char) ||
		char === '_' ||
		char === '$'
	);
}

function isLetter(char: string): boolean {
	return char.toLowerCase() !== char.toUpperCase();
}

function isLowerCase(char: string): boolean {
	return char === char.toLowerCase() && isLetter(char);
}

function isUpperCase(char: string): boolean {
	return char === char.toUpperCase() && isLetter(char);
}

function isDigit(char: string): boolean {
	return char >= "0" && char <= "9";
}

function isHexadecimal(char: string): boolean {
	return (
		isDigit(char) ||
		(char.toLowerCase() >= "a" && char.toLowerCase() <= "f")
	);
}

function isFormatting(char: string): boolean {
	return (
		isWhitespace(char) ||
		isLineBreak(char) ||
		isTab(char) ||
		isCarriageReturn(char) ||
		isFormFeed(char) ||
		isVerticalTab(char)
	);
}

function isWhitespace(char: string): boolean {
	return char == ' '
}

function isLineBreak(char: string): boolean {
	return char == '\n' || isCarriageReturn(char);
}

function isTab(char: string): boolean {
	return char == '\t';
}

function isCarriageReturn(char: string): boolean {
	return char == '\r';
}

function isFormFeed(char: string): boolean {
	return char == '\f';
}

function isVerticalTab(char: string): boolean {
	return char == '\v';
}

function isMathOperator(char: string): boolean {
	switch (char) {
		case '+':case '-':
		case '*':case '/':
		case '%':case '^':
			return true;
		default:
			return false;
	}
}

function isRelationalOperator(char: string): boolean {
	switch (char) {
		case '>':case '<':
		case '=':case '!':
			return true;
		default:
			return false;
	}
}

function isBitwireOperator(char: string): boolean {
	switch (char) {
		case '&':case '|':
		case '^':case '~':
			return true;
		default:
			return false;
	}
}

function isPunctuation(char: string): boolean {
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

function isSymbol(char: string): boolean {
	return (
		!isLetter(char) &&
		!isDigit(char) &&
		!isWhitespace(char) &&
		!isLineBreak(char) &&
		!isTab(char)
	)
}

function isEscape(char: string): boolean {
	return char === '\\';
}

export const _String = {
	capitalize,
	capitalizeAll,
	rightPad,
	leftPad,
	getFirstDifferentIndex,
	getLastDifferentIndex,
	removeCharacters,
	noAccent,
	stringToCharCodeArray,
	toKebabCase,
	isIdentifier,
	isLetter,
	isLowerCase,
	isUpperCase,
	isDigit,
	isHexadecimal,
	isFormatting,
	isWhitespace,
	isLineBreak,
	isTab,
	isCarriageReturn,
	isFormFeed,
	isVerticalTab,
	isMathOperator,
	isRelationalOperator,
	isBitwireOperator,
	isPunctuation,
	isSymbol,
	isEscape,
};

export type TUtilsString = typeof _String;
