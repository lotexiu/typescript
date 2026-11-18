# `language/declarations/programing/typescript`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../../../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TypescriptLang`](#typescriptlang) | constante | Espec de TypeScript sobre o motor `Language`: tipos, expressões, statements e declarações com corpo. Use com `Language.define(TypescriptLang)`; ver as limitações aceitas no topo deste arquivo. |
| [`DECL_RULES`](#decl_rules) | constante | Regras de declaração (`class`, `function`, `interface`, `type`, `enum`, `import`/`export`) registradas em `TypescriptLang.grammar`. |
| [`EXPR_RULES`](#expr_rules) | constante | Regras de expressão registradas em `TypescriptLang.grammar`. |
| [`SHARED_RULES`](#shared_rules) | constante | Regras compartilhadas (nomes, generics, decorators, parâmetros, padrões de desestruturação) registradas em `TypescriptLang.grammar`. |
| [`STMT_RULES`](#stmt_rules) | constante | Regras de statement registradas em `TypescriptLang.grammar`. |
| [`TYPE_RULES`](#type_rules) | constante | Regras de tipo registradas em `TypescriptLang.grammar`. |
| [`preferHashPrivate`](#preferhashprivate) | constante | `private` do TypeScript num membro de classe → sugere `#` (privado real de runtime, não apagado na compilação). Aviso, não erro. Cobre também `constructor(private x: ...)`. Ignora `private constructor`: JavaScript não tem construtor `#`. |
| [`TS_VALIDATIONS`](#ts_validations) | constante | Todas as validações opcionais de TypeScript, para `validate` de uma espec. |

---

## `TypescriptLang`

constante · [src/language/declarations/programing/typescript/declarations.ts:67](../../../../../src/language/declarations/programing/typescript/declarations.ts#L67)

Espec de TypeScript sobre o motor `Language`: tipos, expressões, statements e declarações com corpo. Use com `Language.define(TypescriptLang)`; ver as limitações aceitas no topo deste arquivo.

```ts
const TypescriptLang: TLanguageSpec
```

### Estáticos

#### `scope: { block: ["{", "}"], paren: ["(", ")"], bracket: ["[", "]"], }`

#### `delimited: { blockComment: { open: "/*", close: "*/", trivia: true, subtype: (source, start, end) => (end - start > 4 && source.slice(start, start + 3) === "/**" ? "jsdoc" : undefined), }, lineComment: { open: "//", close: "\n", consumeClose: false, trivia: true }, string: [ { open: '"', close: '"' }, { open: "'", close: "'" }, ], template: { open: "`", close: "`", interpolate: ["${", "}"] }, }`

#### `charClass: { space: { start: (charCode) => charCode === 32 || charCode === 9 || charCode === 11 || charCode === 12, trivia: true }, newline: { start: (charCode) => charCode === 10 || charCode === 13, trivia: true }, identifier: { start: isIdentStart, continue: isIdentContinue }, number: { start: isDigit, continue: isNumberContinue }, }`

#### `literal: { keyword: [...KEYWORDS], punctuation: [...PUNCTUATION], }`

#### `grammar: { ...SHARED_RULES, ...TYPE_RULES, ...EXPR_RULES, ...STMT_RULES, ...DECL_RULES, }`

#### `start: "File"`

#### `escape: "\\"`

#### `validate: TS_VALIDATIONS`

---

## `DECL_RULES`

constante · [src/language/declarations/programing/typescript/grammar-decl.ts:291](../../../../../src/language/declarations/programing/typescript/grammar-decl.ts#L291)

Regras de declaração (`class`, `function`, `interface`, `type`, `enum`, `import`/`export`) registradas em `TypescriptLang.grammar`.

```ts
const DECL_RULES: Record<string, TRule>
```

---

## `EXPR_RULES`

constante · [src/language/declarations/programing/typescript/grammar-expr.ts:399](../../../../../src/language/declarations/programing/typescript/grammar-expr.ts#L399)

Regras de expressão registradas em `TypescriptLang.grammar`.

```ts
const EXPR_RULES: Record<string, TRule>
```

---

## `SHARED_RULES`

constante · [src/language/declarations/programing/typescript/grammar-shared.ts:147](../../../../../src/language/declarations/programing/typescript/grammar-shared.ts#L147)

Regras compartilhadas (nomes, generics, decorators, parâmetros, padrões de desestruturação) registradas em `TypescriptLang.grammar`.

```ts
const SHARED_RULES: Record<string, TRule>
```

---

## `STMT_RULES`

constante · [src/language/declarations/programing/typescript/grammar-stmt.ts:186](../../../../../src/language/declarations/programing/typescript/grammar-stmt.ts#L186)

Regras de statement registradas em `TypescriptLang.grammar`.

```ts
const STMT_RULES: Record<string, TRule>
```

---

## `TYPE_RULES`

constante · [src/language/declarations/programing/typescript/grammar-type.ts:240](../../../../../src/language/declarations/programing/typescript/grammar-type.ts#L240)

Regras de tipo registradas em `TypescriptLang.grammar`.

```ts
const TYPE_RULES: Record<string, TRule>
```

### Estáticos

#### `TypeOperatorOperand: TypeOperator`

---

## `preferHashPrivate`

constante · [src/language/declarations/programing/typescript/validations.ts:22](../../../../../src/language/declarations/programing/typescript/validations.ts#L22)

`private` do TypeScript num membro de classe → sugere `#` (privado real de runtime, não
apagado na compilação). Aviso, não erro. Cobre também `constructor(private x: ...)`.
Ignora `private constructor`: JavaScript não tem construtor `#`.

```ts
const preferHashPrivate: TValidation
```

### Estáticos

#### `name: "prefer-hash-private"`

---

## `TS_VALIDATIONS`

constante · [src/language/declarations/programing/typescript/validations.ts:38](../../../../../src/language/declarations/programing/typescript/validations.ts#L38)

Todas as validações opcionais de TypeScript, para `validate` de uma espec.

```ts
const TS_VALIDATIONS: readonly TValidation[]
```
