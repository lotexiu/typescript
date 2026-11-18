# Extensões globais

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

Ao importar a lib, estes métodos passam a existir nos tipos nativos (`declare global` em `src/declarations.ts`). Cada um repete o utilitário estático de mesmo nome, recebendo o valor como `this`.

## `String`

[src/declarations.ts:10](../../src/declarations.ts#L10)

- `toKebabCase: TFnDeclaration<TUString['toKebabCase']>`
- `capitalize: TFnDeclaration<TUString['capitalize']>`
- `capitalizeAll: TFnDeclaration<TUString['capitalizeAll']>`
- `noAccent: TFnDeclaration<TUString['noAccent']>`
- `charCodeArray: TFnDeclaration<TUString['charCodeArray']>`
- `isIdentifier: TFnDeclaration<TUString['isIdentifier']>`
- `isLetter: TFnDeclaration<TUString['isLetter']>`
- `isLowerCase: TFnDeclaration<TUString['isLowerCase']>`
- `isUpperCase: TFnDeclaration<TUString['isUpperCase']>`
- `isDigit: TFnDeclaration<TUString['isDigit']>`
- `isLetterOrDigit: TFnDeclaration<TUString['isLetterOrDigit']>`
- `isHexadecimal: TFnDeclaration<TUString['isHexadecimal']>`
- `isFormatting: TFnDeclaration<TUString['isFormatting']>`
- `isWhitespace: TFnDeclaration<TUString['isWhitespace']>`
- `isLineBreak: TFnDeclaration<TUString['isLineBreak']>`
- `isTab: TFnDeclaration<TUString['isTab']>`
- `isCarriageReturn: TFnDeclaration<TUString['isCarriageReturn']>`
- `isFormFeed: TFnDeclaration<TUString['isFormFeed']>`
- `isVerticalTab: TFnDeclaration<TUString['isVerticalTab']>`
- `isMathOperator: TFnDeclaration<TUString['isMathOperator']>`
- `isRelationalOperator: TFnDeclaration<TUString['isRelationalOperator']>`
- `isBitwireOperator: TFnDeclaration<TUString['isBitwireOperator']>`
- `isPunctuation: TFnDeclaration<TUString['isPunctuation']>`
- `isSymbol: TFnDeclaration<TUString['isSymbol']>`
- `isEscape: TFnDeclaration<TUString['isEscape']>`
- `forEach: TFnDeclaration<TUString['forEach']>`
- `onChar: TFnDeclaration<TUString['onChar']>`

## `Function`

[src/declarations.ts:40](../../src/declarations.ts#L40)

- `thisAsParameter<T extends TFn>(this: T): TFn`
- `children?: TFn`
- `origin?: TFn`

## `Object`

[src/declarations.ts:46](../../src/declarations.ts#L46)

- `valueFromPath<const T, const Path extends TPath<T>>(this: T, path: Path): TPathValue<T, Path>`
- `setValueFromPath<const T, const Path extends TPath<T>, const Value extends TPathValue<T, Path>>( this: T, path: Path, value: Value ): Value`
- `update<T extends object, U extends Partial<T>>(this: T, updates: U): TAs<T, U>`
- `toJson<T>(this: T, compact: boolean): string`

## `ObjectConstructor`

[src/declarations.ts:57](../../src/declarations.ts#L57)

- `entries<T>(object: T): TEntriesReturn<T>`

## `Array`

[src/declarations.ts:61](../../src/declarations.ts#L61)

- `includes<U>(value: U): value is U & T`
