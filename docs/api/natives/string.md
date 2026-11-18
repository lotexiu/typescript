# `natives/string`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TStrForEeachCallback`](#tstrforeeachcallback) | tipo | `size` is the grapheme's UTF-16 code unit width — 1 for BMP characters, 2+ for surrogate pairs/ZWJ sequences. |
| [`TStrOnCharCallback`](#tstroncharcallback) | tipo | `size` is the matched character's UTF-16 code unit width — 1 for BMP, 2 for an astral code point. |
| [`TReverseStr`](#treversestr) | tipo | Reverses a string literal type character by character. |
| [`TStrToUnion`](#tstrtounion) | tipo | Union of the characters of a string literal type. |
| [`TStrToArray`](#tstrtoarray) | tipo | Tuple of the characters of a string literal type. |
| [`StringUtils`](#stringutils) | classe | String helpers aware of Unicode: emoji and other astral characters count as one character where it matters. The `is*` checks take a single character; with `extended` they use Unicode properties. |
| [`TUString`](#tustring) | tipo | Type of the `StringUtils` class (used to type the `String.prototype` extensions). |

---

## `TStrForEeachCallback`

tipo · [src/natives/string/types.ts:2](../../../src/natives/string/types.ts#L2)

`size` is the grapheme's UTF-16 code unit width — 1 for BMP characters, 2+ for surrogate pairs/ZWJ sequences.

```ts
type TStrForEeachCallback = (char: string, index: number, size: number) => any
```

---

## `TStrOnCharCallback`

tipo · [src/natives/string/types.ts:5](../../../src/natives/string/types.ts#L5)

`size` is the matched character's UTF-16 code unit width — 1 for BMP, 2 for an astral code point.

```ts
type TStrOnCharCallback = (index: number, size: number) => any
```

---

## `TReverseStr`

tipo · [src/natives/string/types.ts:8](../../../src/natives/string/types.ts#L8)

Reverses a string literal type character by character.

```ts
type TReverseStr<T> = T extends `${infer First}${infer Rest}` ? `${TReverseStr<Rest>}${First}` : T
```

---

## `TStrToUnion`

tipo · [src/natives/string/types.ts:14](../../../src/natives/string/types.ts#L14)

Union of the characters of a string literal type.

```ts
type TStrToUnion<T extends string> =
string extends T
	? string
	: T extends `${infer First}${infer Rest}`
		? First | TStrToUnion<Rest> 
		: never
```

Estende `string`.

---

## `TStrToArray`

tipo · [src/natives/string/types.ts:22](../../../src/natives/string/types.ts#L22)

Tuple of the characters of a string literal type.

```ts
type TStrToArray<T extends string> =
T extends `${infer First}${infer Rest}`
	? [First, ...TStrToArray<Rest>]
	: []
```

Estende `string`.

---

## `StringUtils`

classe · [src/natives/string/utils.ts:12](../../../src/natives/string/utils.ts#L12)

String helpers aware of Unicode: emoji and other astral characters count as one character where it matters.
The `is*` checks take a single character; with `extended` they use Unicode properties.

```ts
class StringUtils
```

### Estáticos

#### `static readonly WHITESPACE_CODE = ' '.charCodeAt(0)`

Code unit of a space.

#### `static readonly ESCAPE_CODE = '\\'.charCodeAt(0)`

Code unit of a backslash.

#### `static readonly TAB_CODE = '\t'.charCodeAt(0)`

Code unit of a tab.

#### `static readonly NEWLINE_CODE = '\n'.charCodeAt(0)`

Code unit of a line feed.

#### `static readonly VERTICAL_TAB_CODE = '\v'.charCodeAt(0)`

Code unit of a vertical tab.

#### `static readonly FORM_FEED_CODE = '\f'.charCodeAt(0)`

Code unit of a form feed.

#### `static readonly CARRIAGE_RETURN_CODE = '\r'.charCodeAt(0)`

Code unit of a carriage return.

#### `static readonly FORMAT_CODE_DISTANCE`

First and last code units of the ASCII formatting characters (tab to carriage return).

#### `static readonly DIGIT_CODE_DISTANCE = ['0'.charCodeAt(0), '9'.charCodeAt(0)] as const`

Code units of `0` and `9`.

#### `static readonly HEXADECIMAL_WORD_CODE_DISTANCE = ['a'.charCodeAt(0), 'f'.charCodeAt(0)] as const`

Code units of `a` and `f`.

#### `static readonly ASCII_ALPHABET_SIZE = 128`

Number of ASCII characters (128).

#### `static toKebabCase(str: string): string`

`fontSize` → `font-size`; runs of capitals stay together (`XMLHttp` → `xml-http`).

#### `static capitalize<T extends string>(str: T): Capitalize<T>`

Uppercases the first character, even when it is an emoji-sized one.

#### `static capitalizeAll(str: string, splitStr: string): string`

Capitalizes every part of the text split by `splitStr`.

#### `static padRight(str: string, padChar: string, length: number): string`

Appends `padChar` until the text reaches `length`.

#### `static padLeft(str: string, padChar: string, length: number): string`

Prepends `padChar` until the text reaches `length`.

#### `static noAccent(str: string): string`

Removes accents (`São` → `Sao`).

#### `static charCodeArray(str: string): number[]`

UTF-16 code units of the text (an emoji gives two).

#### `static isIdentifier(char: string, extended: boolean = false): boolean`

Whether the character can appear in a JS identifier (letter, digit, `_`, `$`). `extended` uses Unicode properties (any script); the default checks ASCII only and is faster.

#### `static isLetter(char: string, extended: boolean = false): boolean`

Whether the character is a letter. `extended` uses Unicode properties (any script); the default checks ASCII only and is faster.

#### `static isLowerCase(char: string, extended: boolean = false): boolean`

Whether the character is a lowercase letter. `extended` uses Unicode properties (any script); the default checks ASCII only and is faster.

#### `static isUpperCase(char: string, extended: boolean = false): boolean`

Whether the character is an uppercase letter. `extended` uses Unicode properties (any script); the default checks ASCII only and is faster.

#### `static isDigit(str: string, index?: number, extended: boolean = false): boolean`

Whether every character (or only the one at `index`) is a digit. `extended` uses Unicode properties (any script); the default checks ASCII only and is faster.

#### `static isLetterOrDigit(char: string, extended: boolean = false): boolean`

Whether the character is a letter or a digit. `extended` uses Unicode properties (any script); the default checks ASCII only and is faster.

#### `static isHexadecimal(str: string): boolean`

Whether every character is a hexadecimal digit. Odd lengths above 4 are refused.

#### `static isFormatting(char: string, extended: boolean = false): boolean`

Whether the character is whitespace or a control formatting character (tab, line breaks). `extended` uses Unicode properties (any script); the default checks ASCII only and is faster.

#### `static isWhitespace(char: string, extended: boolean = false): boolean`

Whether the character is whitespace. `extended` uses Unicode properties (any script); the default checks ASCII only and is faster.

#### `static isLineBreak(char: string): boolean`

Whether the character is `\n` or `\r`.

#### `static isTab(char: string): boolean`

Whether the character is a tab.

#### `static isCarriageReturn(char: string): boolean`

Whether the character is `\r`.

#### `static isFormFeed(char: string): boolean`

Whether the character is a form feed.

#### `static isVerticalTab(char: string): boolean`

Whether the character is a vertical tab.

#### `static isMathOperator(char: string): boolean`

Whether the character is `+`, `-`, `*`, `/`, `%` or `^`.

#### `static isRelationalOperator(char: string): boolean`

Whether the character is `<`, `>`, `=` or `!`.

#### `static isBitwireOperator(char: string): boolean`

Whether the character is `&`, `|`, `^` or `~`.

#### `static isPunctuation(char: string, extended: boolean = false): boolean`

Whether the character is punctuation. `extended` uses Unicode properties (any script); the default checks ASCII only and is faster.

#### `static isSymbol(char: string, extended: boolean = false): boolean`

Whether the character is a symbol (math, currency, emoji...). `extended` uses Unicode properties (any script); the default checks ASCII only and is faster.

#### `static isEscape(char: string): char is '\\'`

Whether the character is a backslash.

#### `static forEach(str: string, callback: TStrForEeachCallback)`

Calls `callback` for each character, emoji and joined sequences counting as one; `size` is its length in UTF-16 units.

#### `static onChar(chars: string)`

Prepares a fast search for the given characters. The returned function calls `callback(index, size)` for each occurrence in a text.

#### `static lookupArray(chars: string)`

Table indexed by code unit with 1 for each character of `chars` (sized to the largest code unit).

#### `static lookupArray128(chars: string)`

Same as `lookupArray`, fixed to the ASCII range.

#### `static slugify(text: string): string`

Lowercase, accent-free, hyphen-separated text for URLs (`Olá Mundo!` → `ola-mundo`).

#### `static truncate(text: string, length: number, preserveWords = true): string`

Cuts the text to `length` and appends `...`, at a word boundary unless `preserveWords` is false.

#### `static capitalizeWords(text: string): string`

Uppercases the first letter of each word.

#### `static toSnakeCase(text: string): string`

`fontSize` → `font_size`.

---

## `TUString`

tipo · [src/natives/string/utils.ts:454](../../../src/natives/string/utils.ts#L454)

Type of the `StringUtils` class (used to type the `String.prototype` extensions).

```ts
type TUString = typeof StringUtils
```
