[← Voltar para PROJECT.md](../PROJECT.md)

# natives/string

<a id="_String"></a>
#### [`_String`](../../src/natives/string/implementations.ts#L5) _(class)_

- `@internal`

<a id="_String.toKebabCase"></a>
- [`toKebabCase`](../../src/natives/string/implementations.ts#L7)
  Converts `camelCase`/`PascalCase` to `kebab-case`.
<a id="_String.capitalize"></a>
- [`capitalize`](../../src/natives/string/implementations.ts#L15)
  Uppercases the first character, leaves the rest untouched.
<a id="_String.capitalizeAll"></a>
- [`capitalizeAll`](../../src/natives/string/implementations.ts#L20)
  Splits `str` on `splitStr` and capitalizes every resulting segment.
<a id="_String.rightPad"></a>
- [`rightPad`](../../src/natives/string/implementations.ts#L28)
  Pads `str` on the right with `padChar` up to `length` total characters.
<a id="_String.leftPad"></a>
- [`leftPad`](../../src/natives/string/implementations.ts#L33)
  Pads `str` on the left with `padChar` up to `length` total characters.
<a id="_String.getFirstDifferentIndex"></a>
- [`getFirstDifferentIndex`](../../src/natives/string/implementations.ts#L38)
  Index of the first character where `str1` and `str2` differ, or `defaultValue` if they never do.
<a id="_String.getLastDifferentIndex"></a>
- [`getLastDifferentIndex`](../../src/natives/string/implementations.ts#L50)
  Index of the last character (counting from the end) where `str1` and `str2` differ, or `defaultValue` if they never do.
<a id="_String.removeCharacters"></a>
- [`removeCharacters`](../../src/natives/string/implementations.ts#L63)
  Removes every character in `charsToRemove` from `baseString`.
<a id="_String.noAccent"></a>
- [`noAccent`](../../src/natives/string/implementations.ts#L71)
  Strips diacritics (accents) from `str` via Unicode normalization.
<a id="_String.stringToCharCodeArray"></a>
- [`stringToCharCodeArray`](../../src/natives/string/implementations.ts#L76)
  Maps each character of `str` to its hex char code.
<a id="_String.isIdentifier"></a>
- [`isIdentifier`](../../src/natives/string/implementations.ts#L83)
  True for a character valid in a JS identifier (letter, digit, `_`, or `$`).
<a id="_String.isLetter"></a>
- [`isLetter`](../../src/natives/string/implementations.ts#L93)
  True for any alphabetic character (case-insensitively distinguishable from itself).
<a id="_String.isLowerCase"></a>
- [`isLowerCase`](../../src/natives/string/implementations.ts#L98)
  True for a lowercase letter.
<a id="_String.isUpperCase"></a>
- [`isUpperCase`](../../src/natives/string/implementations.ts#L103)
  True for an uppercase letter.
<a id="_String.isDigit"></a>
- [`isDigit`](../../src/natives/string/implementations.ts#L108)
  True for `0`-`9`.
<a id="_String.isLetterOrDigit"></a>
- [`isLetterOrDigit`](../../src/natives/string/implementations.ts#L113)
  True for a letter or a digit.
<a id="_String.isHexadecimal"></a>
- [`isHexadecimal`](../../src/natives/string/implementations.ts#L118)
  True for a digit or an `a`-`f`/`A`-`F` hex letter.
<a id="_String.isFormatting"></a>
- [`isFormatting`](../../src/natives/string/implementations.ts#L126)
  True for whitespace, a line break, tab, carriage return, form feed, or vertical tab.
<a id="_String.isWhitespace"></a>
- [`isWhitespace`](../../src/natives/string/implementations.ts#L138)
  True for a plain space character.
<a id="_String.isLineBreak"></a>
- [`isLineBreak`](../../src/natives/string/implementations.ts#L143)
  True for `\n` or a carriage return.
<a id="_String.isTab"></a>
- [`isTab`](../../src/natives/string/implementations.ts#L148)
  True for `\t`.
<a id="_String.isCarriageReturn"></a>
- [`isCarriageReturn`](../../src/natives/string/implementations.ts#L153)
  True for `\r`.
<a id="_String.isFormFeed"></a>
- [`isFormFeed`](../../src/natives/string/implementations.ts#L158)
  True for `\f`.
<a id="_String.isVerticalTab"></a>
- [`isVerticalTab`](../../src/natives/string/implementations.ts#L163)
  True for `\v`.
<a id="_String.isMathOperator"></a>
- [`isMathOperator`](../../src/natives/string/implementations.ts#L168)
  True for `+ - * / % ^`.
<a id="_String.isRelationalOperator"></a>
- [`isRelationalOperator`](../../src/natives/string/implementations.ts#L180)
  True for `> < = !`.
<a id="_String.isBitwireOperator"></a>
- [`isBitwireOperator`](../../src/natives/string/implementations.ts#L191)
  True for `& | ^ ~`.
<a id="_String.isPunctuation"></a>
- [`isPunctuation`](../../src/natives/string/implementations.ts#L202)
  True for common punctuation/bracket/quote characters.
<a id="_String.isSymbol"></a>
- [`isSymbol`](../../src/natives/string/implementations.ts#L222)
  True for a character that's none of letter, digit, whitespace, line break, or tab.
<a id="_String.isEscape"></a>
- [`isEscape`](../../src/natives/string/implementations.ts#L233)
  True for `\`.

<a id="TReverseStr"></a>
#### [`TReverseStr`](../../src/natives/string/types.ts#L3) _(type, type-only)_

Reverses a string literal type character by character.

<a id="StringUtils"></a>
#### [`StringUtils`](../../src/natives/string/utils.ts#L4) _(class)_

Public static wrapper over `_String` — case conversion, padding, accent/character-class predicates.

<a id="StringUtils.toKebabCase"></a>
- [`toKebabCase`](../../src/natives/string/utils.ts#L5)
  Converts `camelCase`/`PascalCase` to `kebab-case`.
<a id="StringUtils.capitalize"></a>
- [`capitalize`](../../src/natives/string/utils.ts#L6)
  Uppercases the first character, leaves the rest untouched.
<a id="StringUtils.capitalizeAll"></a>
- [`capitalizeAll`](../../src/natives/string/utils.ts#L7)
  Splits `str` on `splitStr` and capitalizes every resulting segment.
<a id="StringUtils.rightPad"></a>
- [`rightPad`](../../src/natives/string/utils.ts#L8)
  Pads `str` on the right with `padChar` up to `length` total characters.
<a id="StringUtils.leftPad"></a>
- [`leftPad`](../../src/natives/string/utils.ts#L9)
  Pads `str` on the left with `padChar` up to `length` total characters.
<a id="StringUtils.getFirstDifferentIndex"></a>
- [`getFirstDifferentIndex`](../../src/natives/string/utils.ts#L10)
  Index of the first character where `str1` and `str2` differ, or `defaultValue` if they never do.
<a id="StringUtils.getLastDifferentIndex"></a>
- [`getLastDifferentIndex`](../../src/natives/string/utils.ts#L11)
  Index of the last character (counting from the end) where `str1` and `str2` differ, or `defaultValue` if they never do.
<a id="StringUtils.removeCharacters"></a>
- [`removeCharacters`](../../src/natives/string/utils.ts#L12)
  Removes every character in `charsToRemove` from `baseString`.
<a id="StringUtils.noAccent"></a>
- [`noAccent`](../../src/natives/string/utils.ts#L13)
  Strips diacritics (accents) from `str` via Unicode normalization.
<a id="StringUtils.stringToCharCodeArray"></a>
- [`stringToCharCodeArray`](../../src/natives/string/utils.ts#L14)
  Maps each character of `str` to its hex char code.
<a id="StringUtils.isIdentifier"></a>
- [`isIdentifier`](../../src/natives/string/utils.ts#L15)
  True for a character valid in a JS identifier (letter, digit, `_`, or `$`).
<a id="StringUtils.isLetter"></a>
- [`isLetter`](../../src/natives/string/utils.ts#L16)
  True for any alphabetic character (case-insensitively distinguishable from itself).
<a id="StringUtils.isLowerCase"></a>
- [`isLowerCase`](../../src/natives/string/utils.ts#L17)
  True for a lowercase letter.
<a id="StringUtils.isUpperCase"></a>
- [`isUpperCase`](../../src/natives/string/utils.ts#L18)
  True for an uppercase letter.
<a id="StringUtils.isDigit"></a>
- [`isDigit`](../../src/natives/string/utils.ts#L19)
  True for `0`-`9`.
<a id="StringUtils.isLetterOrDigit"></a>
- [`isLetterOrDigit`](../../src/natives/string/utils.ts#L20)
  True for a letter or a digit.
<a id="StringUtils.isHexadecimal"></a>
- [`isHexadecimal`](../../src/natives/string/utils.ts#L21)
  True for a digit or an `a`-`f`/`A`-`F` hex letter.
<a id="StringUtils.isFormatting"></a>
- [`isFormatting`](../../src/natives/string/utils.ts#L22)
  True for whitespace, a line break, tab, carriage return, form feed, or vertical tab.
<a id="StringUtils.isWhitespace"></a>
- [`isWhitespace`](../../src/natives/string/utils.ts#L23)
  True for a plain space character.
<a id="StringUtils.isLineBreak"></a>
- [`isLineBreak`](../../src/natives/string/utils.ts#L24)
  True for `\n` or a carriage return.
<a id="StringUtils.isTab"></a>
- [`isTab`](../../src/natives/string/utils.ts#L25)
  True for `\t`.
<a id="StringUtils.isCarriageReturn"></a>
- [`isCarriageReturn`](../../src/natives/string/utils.ts#L26)
  True for `\r`.
<a id="StringUtils.isFormFeed"></a>
- [`isFormFeed`](../../src/natives/string/utils.ts#L27)
  True for `\f`.
<a id="StringUtils.isVerticalTab"></a>
- [`isVerticalTab`](../../src/natives/string/utils.ts#L28)
  True for `\v`.
<a id="StringUtils.isMathOperator"></a>
- [`isMathOperator`](../../src/natives/string/utils.ts#L29)
  True for `+ - * / % ^`.
<a id="StringUtils.isRelationalOperator"></a>
- [`isRelationalOperator`](../../src/natives/string/utils.ts#L30)
  True for `> < = !`.
<a id="StringUtils.isBitwireOperator"></a>
- [`isBitwireOperator`](../../src/natives/string/utils.ts#L31)
  True for `& | ^ ~`.
<a id="StringUtils.isPunctuation"></a>
- [`isPunctuation`](../../src/natives/string/utils.ts#L32)
  True for common punctuation/bracket/quote characters.
<a id="StringUtils.isSymbol"></a>
- [`isSymbol`](../../src/natives/string/utils.ts#L33)
  True for a character that's none of letter, digit, whitespace, line break, or tab.
<a id="StringUtils.isEscape"></a>
- [`isEscape`](../../src/natives/string/utils.ts#L34)
  True for `\`.

<a id="TUString"></a>
#### [`TUString`](../../src/natives/string/utils.ts#L38) _(type, type-only)_

The `StringUtils` static-member shape — useful for typing something as "whatever `StringUtils` exposes."
