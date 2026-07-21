import { _String } from "./implementations";

/** Public static wrapper over `_String` — case conversion, padding, accent/character-class predicates. */
class StringUtils {
	static readonly toKebabCase = _String.toKebabCase;
	static readonly capitalize = _String.capitalize;
	static readonly capitalizeAll = _String.capitalizeAll;
	static readonly rightPad = _String.rightPad;
	static readonly leftPad = _String.leftPad;
	static readonly getFirstDifferentIndex = _String.getFirstDifferentIndex;
	static readonly getLastDifferentIndex = _String.getLastDifferentIndex;
	static readonly removeCharacters = _String.removeCharacters;
	static readonly noAccent = _String.noAccent;
	static readonly stringToCharCodeArray = _String.stringToCharCodeArray;
	static readonly isIdentifier = _String.isIdentifier;
	static readonly isLetter = _String.isLetter;
	static readonly isLowerCase = _String.isLowerCase;
	static readonly isUpperCase = _String.isUpperCase;
	static readonly isDigit = _String.isDigit;
	static readonly isLetterOrDigit = _String.isLetterOrDigit;
	static readonly isHexadecimal = _String.isHexadecimal;
	static readonly isFormatting = _String.isFormatting;
	static readonly isWhitespace = _String.isWhitespace;
	static readonly isLineBreak = _String.isLineBreak;
	static readonly isTab = _String.isTab;
	static readonly isCarriageReturn = _String.isCarriageReturn;
	static readonly isFormFeed = _String.isFormFeed;
	static readonly isVerticalTab = _String.isVerticalTab;
	static readonly isMathOperator = _String.isMathOperator;
	static readonly isRelationalOperator = _String.isRelationalOperator;
	static readonly isBitwireOperator = _String.isBitwireOperator;
	static readonly isPunctuation = _String.isPunctuation;
	static readonly isSymbol = _String.isSymbol;
	static readonly isEscape = _String.isEscape;
}

/** The `StringUtils` static-member shape — useful for typing something as "whatever `StringUtils` exposes." */
type TUString = typeof StringUtils;

export {
	StringUtils,
	TUString
}
