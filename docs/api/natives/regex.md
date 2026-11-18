# `natives/regex`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`REGEX_PATTERNS`](#regex_patterns) | constante | Reusable regex sources as strings (compile with `new RegExp`), grouped by subject. Exposed as `RegexUtils.patterns`. |
| [`RegexUtils`](#regexutils) | classe | Precompiled regular expressions and the checks built on them. |

---

## `REGEX_PATTERNS`

constante · [src/natives/regex/declarations.ts:11](../../../src/natives/regex/declarations.ts#L11)

Reusable regex sources as strings (compile with `new RegExp`), grouped by subject. Exposed as `RegexUtils.patterns`.

```ts
const REGEX_PATTERNS
```

### Estáticos

#### `RESERVED: { REGEX_KEYS: '[.*+?^${}()|[\\\]\\\\]', ESCAPE: '\\$&' }`

#### `DATE: { ...DATE, ISO: `${DATE.YEAR}${DATE.SEPARATOR}${DATE.MONTH}\\2${DATE.DAY}`, MDY: `${DATE.MONTH}${DATE.SEPARATOR}${DATE.DAY}\\2${DATE.YEAR}`, DMY: `${DATE.DAY}${DATE.SEPARATOR}${DATE.MONTH}\\2${DATE.YEAR}`, }`

#### `WHITESPACE: { BASIC: '\\s', EXTENDED: '\\p{Z}', LINE_BREAK: '\\r\\n|\\r|\\n', }`

#### `LETTERS: { BASIC: { ALL: '[A-Za-z]', UPPERCASE: '[A-Z]', LOWERCASE: '[a-z]', }, EXTENDED: { ALL: '\\p{L}', UPPERCASE: '\\p{Lu}', LOWERCASE: '\\p{Ll}', }, }`

#### `WORD: { BASIC: '\\w', EXTENDED: '[\\p{L}\\p{N}_]', }`

#### `DIGITS: { BASIC: '[0-9]', EXTENDED: '\\p{Nd}', ROMAN: '[IVXLCDM]', HEX: '[0-9a-fA-F]', }`

#### `SYMBOLS: { PUNCTUATION: { EXTENDED: '\\p{P}', MATH: '\\p{Sm}', }, CURRENCY: '\\p{Sc}', PRESENTATION: '\\p{Emoji_Presentation}', EMOJI: '\\p{RGI_Emoji}', ALL: '[^\\p{L}]', }`

#### `UNICODE: { HIGH_SURROGATE: '[\\uD800-\\uDBFF]', }`

#### `ID: { UUID: '[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}', }`

#### `NUMBER: { DIGITS_ONLY: '\\d+', NON_DIGIT: '\\D', LEADING_ZEROS: '0+(?=\\d)', TRAILING_ZEROS: '0+', }`

---

## `RegexUtils`

classe · [src/natives/regex/utils.ts:4](../../../src/natives/regex/utils.ts#L4)

Precompiled regular expressions and the checks built on them.

```ts
class RegexUtils
```

### Estáticos

#### `static readonly patterns = REGEX_PATTERNS`

The pattern sources (`REGEX_PATTERNS`).

#### `static escapeReservedKeys(value: String)`

Escapes regex special characters so the text matches literally.

#### `static hasAstralChar(value: string): boolean`

Whether the text has characters outside the BMP (emoji, some symbols) — the ones that take two UTF-16 units.

#### `static isUuid(value: string): boolean`

UUID textual (qualquer versão 1–8, variante RFC 4122).

#### `static isDigits(value: string): boolean`

Só dígitos `0-9`, ao menos um.

#### `static stripNonDigits(value: string): string`

Remove tudo que não for dígito `0-9`.

#### `static trimLeadingZeros(value: string): string`

`'0042'` → `'42'`; `'000'` → `'0'` (sempre sobra um dígito).

#### `static trimTrailingZeros(value: string): string`

`'1500'` → `'15'`; `'000'` → `''`.
