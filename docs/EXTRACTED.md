# Documentação extraída

_Gerado por `scripts/doc/generate.ts` — extração puramente sintática, sem type-checker._

75 arquivos, 203 declarações top-level.

---
## src/aho-corasick/model.ts

#### `ALPHABET_SIZE` — const _(local, L4)_

Range coberto pela tabela flat (ASCII) — igual ao fast-path do `Parser` (`Uint8Array[128]`); code >=128 sempre volta pra raiz.

#### `TTrieNode` — type _(local, L6)_

#### `AhoCorasick` — class _(exported, L13)_

## src/aho-corasick/types.ts

#### `TPattern` — type _(exported, L1)_

#### `TAhoCorasickMatch` — type _(exported, L6)_

#### `TOnPositionHook` — type _(exported, L13)_

#### `TOnMatchHook` — type _(exported, L22)_

#### `TAhoCorasickScanHooks` — type _(exported, L24)_

## src/ast/grammar/model.ts

#### `Grammar` — class _(exported, L10)_

Motor de gramática declarativo sobre um stream de tokens (`Lexer.tokens`). Regras são
montadas com os combinadores de `GrammarUtils`; `parse` devolve uma `AstRoot`. Cada
regra nomeada é memoizada por posição (packrat) — tempo linear.

## src/ast/grammar/types.ts

#### `TCapture` — type _(exported, L10)_

Uma captura produzida por um matcher: um nó, opcionalmente rotulado como campo.
`leaf` marca nós vindos de um terminal (`tok`/`val`/`kindVal`) — se não forem
nomeados por um `field`, `node(...)` os descarta (pontuação não entra na árvore).

#### `TMatchResult` — type _(exported, L17)_

#### `TGrammarCtx` — type _(exported, L22)_

#### `TMatcher` — type _(exported, L33)_

## src/ast/grammar/utils.ts

#### `GrammarUtils` — class _(exported, L11)_

Combinadores para montar regras de `Grammar` — todos `static`, sem estado. Cada um
devolve um `TMatcher`; compõem-se livremente (`seq(choice(...), many(...))`). Chamadas
entre irmãos usam sempre `GrammarUtils.x` (nunca `this`) para sobreviver a destructuring
no consumidor.

## src/ast/node/model.ts

#### `AstNode` — class _(exported, L8)_

Nó genérico de uma árvore sintática. `kind` é uma string livre definida pela gramática
que o produziu — o motor não conhece nenhum vocabulário fixo. Guarda apenas offsets no
source da raiz (flyweight); `text` fatia sob demanda, igual `ParserNode.content`.

#### `AstRoot` — class _(exported, L61)_

## src/ast/node/types.ts

#### `TAstVisitor` — type _(exported, L4)_

Callback de `AstNode.walk` / `AstRoot.walk` — retornar `false` poda a subárvore atual.

## src/computed/model.ts

#### `Computed` — class _(exported, L5)_

#### `computed` — function _(exported, L45)_

## src/computed/types.ts

#### `TSubscription` — type _(exported, L3)_

## src/declarations.ts

#### `String` — interface _(local, L11)_

#### `Function` — interface _(local, L41)_

#### `Object` — interface _(local, L47)_

## src/filters/declarations.ts

#### `DEFAULT_DEBOUNCE_DURATION` — let _(exported, L4)_

Default `debounce()` delay in milliseconds, when none is given.

#### `DEFAULT_THROTTLE_INTERVAL` — let _(exported, L7)_

#### `DEFAULT_STEP_AMOUNT` — let _(exported, L10)_

## src/filters/implementations.ts

#### `debounce` — function _(exported, L7)_

Delays calling `fn` until `delay` ms have passed with no further calls — each call reschedules with the latest arguments.

#### `throttle` — function _(exported, L24)_

#### `step` — function _(exported, L38)_

#### `once` — function _(exported, L52)_

## src/filters/types.ts

#### `TDebounceFn` — type _(exported, L4)_

The wrapped function `debounce()` returns — callable like `T`, plus `clear()` to cancel a pending call.

#### `TThrottleFn` — type _(exported, L9)_

#### `TStepFn` — type _(exported, L14)_

#### `TOnceFn` — type _(exported, L19)_

## src/global/implementations.ts

#### `_Global` — class _(exported, L8)_

- `@internal`

## src/global/types.ts

#### `TargetImpl` — type _(exported, L5)_

The shape `_Global.register` expects: an optional function-valued override for each method of `T`'s instances (except `valueOf`).

## src/global/utils.ts

#### `GlobalUtils` — class _(exported, L4)_

Public static wrapper over `_Global` — registers method overrides directly onto a native prototype (e.g. `String.prototype`).

## src/item/model.ts

#### `Item` — class _(exported, L5)_

## src/lazy-readonly-value/model.ts

#### `LazyReadonlyValue` — class _(exported, L1)_

#### `lazyReadonlyValue` — function _(exported, L18)_

## src/lexer/model.ts

#### `Token` — class _(local, L10)_

`value` só faz o slice no 1º acesso — sem closure por token (custava mais que o resto do scan inteiro, ver benchmark).

#### `Lexer` — class _(exported, L25)_

## src/lexer/types.ts

#### `TToken` — type _(exported, L1)_

#### `TTokenLiteralRule` — type _(exported, L8)_

#### `TTokenCharClassRule` — type _(exported, L14)_

#### `TTokenDelimitedRule` — type _(exported, L24)_

#### `TTokenRule` — type _(exported, L33)_

## src/mask/compiled-pattern/model.ts

#### `MaskCompiledPattern` — class _(exported, L5)_

## src/mask/model.ts

#### `Mask` — class _(exported, L11)_

## src/mask/token/model.ts

#### `TMaskStaticToken` — class _(exported, L3)_

#### `TMaskRuleToken` — class _(exported, L7)_

#### `TMaskToken` — type _(exported, L20)_

## src/mask/types.ts

#### `TMaskRule` — type _(exported, L3)_

## src/model/model.ts

#### `Model` — class _(exported, L8)_

Menor primitivo reativo da lib: guarda um valor e notifica assinantes quando ele muda.
Não sabe de UI/DOM e não é um plugin — é a peça que plugins "adaptadores de util"
(ex.: MaskPlugin) usam por baixo para virar reativos sem reimplementar notify-on-change.

#### `model` — function _(exported, L42)_

## src/natives/array/implementations.ts

#### `_Array` — class _(exported, L5)_

- `@internal`

## src/natives/array/types.ts

#### `TArray` — type _(exported, L4)_

Thin alias over the built-in `Array<T>`.

#### `TArrayLike` — type _(exported, L7)_

Thin alias over the built-in `ArrayLike<T>`.

#### `TExtractValues` — type _(exported, L10)_

The union of every element type in a tuple/array `T`.

#### `TArrayType` — type _(exported, L13)_

Extracts an array type's element type — `never` if `T` isn't an array.

#### `TValueOf` — type _(exported, L16)_

The element type at `Index` in tuple `List` — `-1` means the last element.

#### `TArrayRest` — type _(exported, L25)_

The remaining tuple elements of `A` after removing the leading elements shared with `B`.

#### `TArrayOf` — type _(exported, L30)_

#### `TPair` — type _(exported, L37)_

#### `TAsArray` — type _(exported, L40)_

`T` itself if it's already an array type, otherwise `never`.

#### `TReverseArray` — type _(exported, L43)_

Reverses the element order of a tuple type.

## src/natives/array/utils.ts

#### `ArrayUtils` — class _(exported, L4)_

Public static wrapper over `_Array` — array helpers (currently a type-narrowing `includes` check).

## src/natives/class/declarations.ts

#### `Timeout` — type _(exported, L4)_

The real `NodeJS.Timeout` type/value pair — Node doesn't expose this constructor directly, so it's recovered from a throwaway `setTimeout` call.

#### `Timeout` — const _(exported, L6)_

The real `NodeJS.Timeout` type/value pair — Node doesn't expose this constructor directly, so it's recovered from a throwaway `setTimeout` call.

## src/natives/class/implementations.ts

#### `_Class` — class _(exported, L6)_

- `@internal`

## src/natives/class/types.ts

#### `TPrototype` — type _(exported, L4)_

The shape of an object exposing a `constructor: TConstructor<T>`.

#### `TClazz` — type _(exported, L9)_

A constructable, class-like type — `TConstructor<T>` intersected with `Function`/`NewableFunction`.

#### `TExtendClass` — type _(exported, L14)_

`TClazz<T>`, optionally merged with `E`'s shape — for typing subclassing/mixin-style extension.

#### `TTimeout` — type _(exported, L19)_

## src/natives/class/utils.ts

#### `ClassUtils` — class _(exported, L4)_

Public static wrapper over `_Class` — instance/constructor type-narrowing check.

## src/natives/date/declarations.ts

#### `MS_CONVERTIONS` — const _(exported, L3)_

## src/natives/date/implementations.ts

#### `_Date` — class _(exported, L6)_

- `@internal`

#### `parseISO` — const _(exported, L33)_

## src/natives/date/types.ts

#### `TMSConvertion` — type _(exported, L3)_

#### `TMSConvertions` — type _(exported, L4)_

#### `TTimeUnit` — type _(exported, L5)_

## src/natives/date/utils.ts

#### `DateUtils` — class _(exported, L4)_

Public static wrapper over `_Date` — strict date parsing.

## src/natives/function/implementations.ts

#### `_Function` — class _(exported, L6)_

- `@internal`

## src/natives/function/types.ts

#### `TFnType` — type _(local, L4)_

#### `TFn` — type _(exported, L6)_

#### `TFnDeclaration` — type _(exported, L17)_

#### `TBindFnOption` — type _(local, L23)_

#### `TBindFn` — type _(exported, L30)_

#### `TModifyFnParameters` — type _(exported, L38)_

#### `TModifyFnReturn` — type _(exported, L44)_

`Fn`'s type with its return type replaced by `ReturnType`, keeping its original parameters.

#### `TParameters` — type _(exported, L50)_

Extracts a function type's parameter tuple (tolerates non-function `T`, resolving to `never` instead of requiring `(...args: any) => any`).

#### `TReturnType` — type _(exported, L53)_

Extracts a function type's return type — thin alias over the built-in `ReturnType`.

#### `TConstructor` — type _(exported, L56)_

An abstract constructor type shape: `abstract new (...args: Args) => T`.

#### `TConstructorInfo` — type _(exported, L62)_

Splits a constructor type into its `{ instance, parameters }` shape.

#### `TConstructorParameters` — type _(exported, L68)_

Extracts a constructor type's parameter tuple.

#### `TInstanceType` — type _(exported, L74)_

Extracts a constructor type's instance type — thin alias over the built-in `InstanceType`.

## src/natives/math/implementations.ts

#### `_Math` — class _(exported, L6)_

- `@internal`

## src/natives/math/types.ts

#### `IDigitSum` — type _(local, L3)_

#### `IDigitSubtract` — type _(local, L19)_

## src/natives/math/utils.ts

#### `MathUtils` — class _(exported, L4)_

Public static wrapper over `_Math` — basic numeric helpers (currently just clamping to a range).

## src/natives/number/implementations.ts

#### `_Number` — class _(exported, L4)_

- `@internal`

## src/natives/number/types.ts

#### `TDigit` — type _(exported, L2)_

A single decimal digit literal type, `0`-`9`.

#### `TNumberTypes` — type _(local, L4)_

#### `TNumber` — type _(exported, L7)_

Parses a numeric string/number literal type into its number literal type — `never` if `T` isn't numeric.

#### `TAbs` — type _(exported, L10)_

The absolute value of a numeric literal type, as a number literal type.

#### `TNegative` — type _(exported, L13)_

`T` itself if its literal value is negative, otherwise `never`.

#### `TPositive` — type _(exported, L16)_

`T` itself if its literal value is non-negative, otherwise `never`.

#### `TNegate` — type _(exported, L19)_

The arithmetic negation of a numeric literal type.

#### `TDigitCompare` — type _(exported, L27)_

Compares two single-digit literal types: `-1` (`A < B`), `0` (equal), or `1` (`A > B`), via a static lookup table.

## src/natives/number/utils.ts

#### `NumberUtils` — class _(exported, L4)_

Public static wrapper over `_Number` — raw-text-to-number parsing.

## src/natives/object/implementations.ts

#### `_Object` — class _(exported, L7)_

- `@internal`

## src/natives/object/types.native.ts

#### `TRequired` — type _(exported, L9)_

Makes all properties of T required.

- `@example`

#### `TReadonly` — type _(exported, L17)_

Makes all properties of T readonly.

- `@example`

#### `TPick` — type _(exported, L25)_

From T, picks a set of properties whose keys are in the union K.

- `@example`

#### `TOmit` — type _(exported, L35)_

Constructs a type with the properties of T except for those in type K.

- `@example`

#### `TPartial` — type _(exported, L43)_

Makes all properties of T optional.

- `@example`

## src/natives/object/types.ts

#### `TNonObject` — type _(exported, L4)_

Basic Non-object types (primitives, functions, and arrays). Used for filtering out non-object values.

#### `TObject` — type _(exported, L7)_

`T` narrowed to plain-object shapes only — `never` for functions, arrays, or non-objects.

#### `TIterate` — type _(exported, L10)_

Keys of `T` that are iterable (string or number).

#### `TKeyOfOptions` — type _(local, L12)_

#### `TKeyOf` — type _(exported, L18)_

#### `TRecord` — type _(exported, L28)_

#### `TCommonFields` — type _(exported, L33)_

The subset of `T`'s fields whose keys also exist on `U`.

#### `TRecursiveKeys` — type _(local, L36)_

Keys of `T` that are recursive (i.e., their values are also of of type `T`).

#### `TDeepPartial` — type _(exported, L41)_

`T` with every nested property (recursively) made optional.

#### `TPath` — type _(exported, L51)_

#### `TPathValue` — type _(exported, L58)_

#### `TEntriesReturn` — type _(exported, L70)_

The `[key, value]` tuple union `Object.entries(value)` would produce for `T` — the return type of `ObjectUtils.entries`.

#### `TDiffTypes` — type _(local, L74)_

#### `TDiffObject` — interface _(local, L75)_

#### `TDiffValues` — type _(exported, L78)_

#### `TDiff` — type _(exported, L80)_

## src/natives/object/utils.ts

#### `ObjectUtils` — class _(exported, L5)_

Public static wrapper over `_Object` — object/path/diff helpers (path-based get/set, shallow merge, entries, null checks, safe JSON, structural diff).

## src/natives/regex/declarations.ts

#### `DATE` — const _(local, L1)_

#### `REGEX_PATTERNS` — const _(exported, L8)_

## src/natives/regex/implementations.ts

#### `_Regex` — class _(exported, L3)_

## src/natives/string/implementations.ts

#### `_String` — class _(exported, L10)_

- `@internal`

## src/natives/string/types.ts

#### `TStrForEeachCallback` — type _(exported, L2)_

`size` is the grapheme's UTF-16 code unit width — 1 for BMP characters, 2+ for surrogate pairs/ZWJ sequences.

#### `TStrOnCharCallback` — type _(exported, L5)_

#### `TReverseStr` — type _(exported, L8)_

#### `TStrToUnion` — type _(exported, L13)_

#### `TStrToArray` — type _(exported, L20)_

## src/natives/string/utils.ts

#### `StringUtils` — class _(exported, L4)_

Public static wrapper over `_String` — case conversion, padding, accent/character-class predicates.

#### `TUString` — type _(exported, L37)_

## src/natives/types.ts

#### `TAwaited` — type _(exported, L7)_

Recursively unwraps the "awaited" type of a type. Non-promise thenables should resolve to `never`. This emulates the behavior of `await`.

- `@example`

#### `TNoInfer` — type _(exported, L15)_

Marker for type position without inference.

- `@example`

#### `TNonNullable` — type _(exported, L23)_

Removes null and undefined from T.

- `@example`

#### `TExclude` — type _(exported, L31)_

Excludes from T the types that are assignable to U.

- `@example`

#### `TExtract` — type _(exported, L39)_

Extracts from T the types that are assignable to U.

- `@example`

## src/parser/model.ts

#### `TGatePatternInfo` — type _(local, L7)_

#### `Parser` — class _(exported, L12)_

## src/parser/node/model.ts

#### `ParserGate` — class _(exported, L3)_

#### `ParserGap` — class _(exported, L17)_

#### `ParserNode` — class _(exported, L33)_

#### `ParserRoot` — class _(exported, L69)_

## src/state/keyboard/model.ts

#### `KeyboardState` — class _(exported, L7)_

## src/state/keyboard/types.ts

#### `TKeyCode` — type _(exported, L8)_

A keyboard key identifier. Kept as a plain `string` (matches
`KeyboardEvent.code`-shaped values like `"KeyA"`/`"ShiftLeft"`) rather
than importing `html/managers/keyboard`'s exhaustive literal union —
this module has no dependency on the DOM-facing manager, on purpose
(see `model.ts`).

## src/state/mouse/model.ts

#### `MouseState` — class _(exported, L6)_

## src/state/mouse/types.ts

#### `TButtons` — type _(exported, L2)_

#### `TMousePosition` — type _(exported, L4)_

## src/stopwatch/model.ts

#### `StopWatch` — class _(exported, L4)_

## src/subscription/model.ts

#### `Subscription` — class _(exported, L3)_

#### `SubscriptionController` — class _(exported, L20)_

## src/subscription/types.ts

#### `TValueListener` — type _(exported, L2)_

Listener signature `ValueCell.subscribe(...)` accepts.

#### `TValueUnsubscribe` — type _(exported, L5)_

The unsubscribe function `ValueCell.subscribe(...)` returns.

## src/theme/model.ts

#### `Theme` — class _(local, L5)_

## src/theme/palette/constants.ts

#### `TONE_STOPS` — const _(exported, L3)_

#### `BASIC` — const _(local, L6)_

#### `LIGHT` — const _(local, L30)_

#### `PASTEL` — const _(local, L44)_

#### `NEON` — const _(local, L58)_

#### `DARK` — const _(local, L72)_

#### `EARTH` — const _(local, L86)_

#### `PALETTES` — const _(exported, L99)_

## src/theme/palette/model.ts

#### `Palette` — class _(exported, L8)_

#### `CustomPalette` — class _(exported, L49)_

#### `TonalPalette` — class _(exported, L63)_

## src/theme/palette/types.ts

#### `TToneStops` — type _(exported, L3)_

#### `TToneStop` — type _(exported, L4)_

## src/theme/style/model.ts

#### `ThemeStyle` — class _(exported, L3)_

#### `N` — const _(local, L4)_

#### `S` — const _(local, L5)_

#### `C` — const _(local, L6)_

## src/theme/style/types.ts

#### `SlotColor` — type _(exported, L5)_

## src/theme/types.ts

#### `TThemeMode` — type _(exported, L2)_

## src/types.ts

#### `_typeof` — const _(local, L1)_

#### `TTypeOfValue` — type _(exported, L4)_

The literal union of every possible result of the `typeof` operator (`"string"`, `"number"`, etc).

#### `TNullable` — type _(exported, L7)_

`Type` widened with `undefined`/`null` (and `void`, unless `NoVoid` is `true`).

#### `TNotUndefined` — type _(exported, L15)_

`T` with `undefined` excluded from the union.

#### `TAs` — type _(exported, L18)_

`T` narrowed/cast to `T & U` when `T` is assignable to `U`, otherwise `never`.

#### `TUnkown` — type _(exported, L21)_

`T` itself if it has no known keys (e.g. `unknown`, `{}`), otherwise `never`.

#### `TSameType` — type _(exported, L24)_

`A` if `A` and `B` are structurally identical (mutually assignable), otherwise `never`.

## src/value-history/model.ts

#### `ValueHistory` — class _(exported, L5)_

## src/value-history/types.ts

#### `TIndexedValue` — type _(exported, L2)_

A value paired with its position in `ValueHistory`'s stack.

#### `TValueHistoryType` — type _(exported, L8)_

The kind of history-changing action being reported (currently just `'register'`, or `false` for none).

#### `TValueHistoryState` — interface _(exported, L11)_

#### `TNewValueHistoryState` — interface _(exported, L18)_

#### `TValueHistoryCallBack` — type _(exported, L23)_

#### `TValueHistoryClearCallback` — type _(exported, L26)_

Listener signature for `ValueHistory` being cleared — receives the full history that was discarded.

## src/variant/model.ts

#### `Variant` — class _(exported, L6)_

#### `variant` — function _(exported, L35)_

## src/variant/types.ts

#### `TVariantDerive` — type _(exported, L2)_

Resolves the value for a given variant name — the function a `VariantCell` is constructed with.

#### `TVariant` — type _(exported, L3)_
