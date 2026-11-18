# `natives/object`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`INTERNAL`](#internal) | constante | Key under which composables keep their private state (`instance[INTERNAL]`). |
| [`TRequired`](#trequired) | tipo | Makes all properties of T required. |
| [`TReadonly`](#treadonly) | tipo | Makes all properties of T readonly. |
| [`TPick`](#tpick) | tipo | From T, picks a set of properties whose keys are in the union K. |
| [`TOmit`](#tomit) | tipo | Constructs a type with the properties of T except for those in type K. |
| [`TPartial`](#tpartial) | tipo | Makes all properties of T optional. |
| [`TNonObject`](#tnonobject) | tipo | Primitive types — what is not an object. |
| [`TObject`](#tobject) | tipo | `T` narrowed to plain-object shapes only — `never` for functions, arrays, or non-objects. |
| [`TIterKeyType`](#titerkeytype) | tipo | Key types iterated by `TIterate`. |
| [`TIterate`](#titerate) | tipo | Keys of `T` that are iterable (string or number). |
| [`TKeyOf`](#tkeyof) | tipo | Keys of `T` restricted to `KeyTypes`, minus `RemoveKey`. |
| [`TRecord`](#trecord) | tipo | Builds an object type from a union of `[key, value]` tuples — the inverse of `TEntriesReturn`. |
| [`TCommonFields`](#tcommonfields) | tipo | The subset of `T`'s fields whose keys also exist on `U`. |
| [`TKeysType`](#tkeystype) | tipo | Keys of `T` whose values extend `U`. |
| [`TMethodKey`](#tmethodkey) | tipo | Keys of `T` whose values are functions. |
| [`TDeepPartial`](#tdeeppartial) | tipo | `T` with every nested property (recursively) made optional. |
| [`TPath`](#tpath) | tipo | Every valid dot-separated path string into `T`, including nested object paths — used to type `valueFromPath`/`setValueFromPath`. |
| [`TPathValue`](#tpathvalue) | tipo | Resolves the type found at a dot-separated `Path` string into `T` (the return type of `valueFromPath`). |
| [`TEntriesReturn`](#tentriesreturn) | tipo | The array of `[key, value]` tuples `Object.entries(value)` would produce for `T` — the return type of `ObjectUtils.entries`. |
| [`TDiffAdd`](#tdiffadd) | tipo | Diff entry: the value exists only on the right side. |
| [`TDiffRemoved`](#tdiffremoved) | tipo | Diff entry: the value exists only on the left side. |
| [`TDiffChanged`](#tdiffchanged) | tipo | Diff entry: both sides exist and differ. |
| [`TDiffType`](#tdifftype) | tipo | Diff entry of two non-object values. |
| [`TDiff`](#tdiff) | tipo | Result type of a deep diff: objects keep their shape, leaves become diff entries. |
| [`TInternal`](#tinternal) | tipo | Object carrying private state under the `INTERNAL` key. |
| [`isNull`](#isnull) | constante | Shortcuts for the `ObjectUtils` methods of the same name. |
| [`isNullOrUndefined`](#isnullorundefined) | constante | Shortcuts for the `ObjectUtils` methods of the same name. |
| [`json`](#json) | constante | Shortcuts for the `ObjectUtils` methods of the same name. |
| [`isObject`](#isobject) | constante | Shortcuts for the `ObjectUtils` methods of the same name. |

---

## `INTERNAL`

constante · [src/natives/object/declarations.ts:2](../../../src/natives/object/declarations.ts#L2)

Key under which composables keep their private state (`instance[INTERNAL]`).

```ts
const INTERNAL = Symbol('internal')
```

---

## `TRequired`

tipo · [src/natives/object/types.native.ts:9](../../../src/natives/object/types.native.ts#L9)

Makes all properties of T required.

```ts
type TRequired<T> = Required<T>
```

**Exemplo**

```ts
type RequiredExample = _Required<{ a?: number; b?: string }>; // { a: number; b: string }
```

---

## `TReadonly`

tipo · [src/natives/object/types.native.ts:17](../../../src/natives/object/types.native.ts#L17)

Makes all properties of T readonly.

```ts
type TReadonly<T> = Readonly<T>
```

**Exemplo**

```ts
type ReadonlyExample = _Readonly<{ a: number; b?: string }>; // { readonly a: number; readonly b: string }
```

---

## `TPick`

tipo · [src/natives/object/types.native.ts:25](../../../src/natives/object/types.native.ts#L25)

From T, picks a set of properties whose keys are in the union K.

```ts
type TPick<T, KeyType> = { … }
```

**Exemplo**

```ts
type PickExample = _Pick<{ a: number; b: string }, 'a'>; // { a: number }
```

---

## `TOmit`

tipo · [src/natives/object/types.native.ts:35](../../../src/natives/object/types.native.ts#L35)

Constructs a type with the properties of T except for those in type K.

```ts
type TOmit<T, K extends keyof any> = Omit<T, K>
```

Estende `keyof`.

**Exemplo**

```ts
type OmitExample = _Omit<{ a: number; b: string }, 'a'>; // { b: string }
```

---

## `TPartial`

tipo · [src/natives/object/types.native.ts:43](../../../src/natives/object/types.native.ts#L43)

Makes all properties of T optional.

```ts
type TPartial<T> = Partial<T>
```

**Exemplo**

```ts
type PartialExample = _Partial<{ a: number; b: string }>; // { a?: number; b?: string }
```

---

## `TNonObject`

tipo · [src/natives/object/types.ts:6](../../../src/natives/object/types.ts#L6)

Primitive types — what is not an object.

```ts
type TNonObject = String | Number | Boolean | BigInt | Symbol | null | undefined | Function | readonly any[]
```

---

## `TObject`

tipo · [src/natives/object/types.ts:10](../../../src/natives/object/types.ts#L10)

`T` narrowed to plain-object shapes only — `never` for functions, arrays, or non-objects.

```ts
type TObject<T> = Exclude<T, TNonObject> & object
```

---

## `TIterKeyType`

tipo · [src/natives/object/types.ts:13](../../../src/natives/object/types.ts#L13)

Key types iterated by `TIterate`.

```ts
type TIterKeyType = string | number
```

---

## `TIterate`

tipo · [src/natives/object/types.ts:16](../../../src/natives/object/types.ts#L16)

Keys of `T` that are iterable (string or number).

```ts
type TIterate<T, KeyTypes extends TIterKeyType = TIterKeyType> = T extends never ? never : keyof T & KeyTypes
```

Estende [`TIterKeyType`](object.md#titerkeytype) — os membros herdados estão documentados lá.

---

## `TKeyOf`

tipo · [src/natives/object/types.ts:20](../../../src/natives/object/types.ts#L20)

Keys of `T` restricted to `KeyTypes`, minus `RemoveKey`.

```ts
type TKeyOf<T, KeyTypes = PropertyKey, RemoveKey = never> = Exclude<keyof T & KeyTypes, RemoveKey>
```

---

## `TRecord`

tipo · [src/natives/object/types.ts:23](../../../src/natives/object/types.ts#L23)

Builds an object type from a union of `[key, value]` tuples — the inverse of `TEntriesReturn`.

```ts
type TRecord<T extends TPair = TPair> = { … }
```

Estende [`TPair`](array.md#tpair) — os membros herdados estão documentados lá.

---

## `TCommonFields`

tipo · [src/natives/object/types.ts:28](../../../src/natives/object/types.ts#L28)

The subset of `T`'s fields whose keys also exist on `U`.

```ts
type TCommonFields<T, U> = keyof T & keyof U
```

---

## `TKeysType`

tipo · [src/natives/object/types.ts:31](../../../src/natives/object/types.ts#L31)

Keys of `T` whose values extend `U`.

```ts
type TKeysType<T, U> = { [K in keyof T]: T[K] extends U ? K : never; }[keyof T]
```

Estende `U`.

---

## `TMethodKey`

tipo · [src/natives/object/types.ts:36](../../../src/natives/object/types.ts#L36)

Keys of `T` whose values are functions.

```ts
type TMethodKey<T> = TKeysType<T, Function>
```

---

## `TDeepPartial`

tipo · [src/natives/object/types.ts:39](../../../src/natives/object/types.ts#L39)

`T` with every nested property (recursively) made optional.

```ts
type TDeepPartial<T> = { … }
```

---

## `TPath`

tipo · [src/natives/object/types.ts:48](../../../src/natives/object/types.ts#L48)

Every valid dot-separated path string into `T`, including nested object paths — used to type `valueFromPath`/`setValueFromPath`.

```ts
type TPath<T, AsT = '' | TNil> =
TObject<T> extends infer R ?
	{
		[K in TIterate<R>]: AsT | K | `${K}.${TPath<R[K], never>}`;
	}[TIterate<R>]
:	never
```

Estende `infer`.

---

## `TPathValue`

tipo · [src/natives/object/types.ts:56](../../../src/natives/object/types.ts#L56)

Resolves the type found at a dot-separated `Path` string into `T` (the return type of `valueFromPath`).

```ts
type TPathValue<T, Path extends TPath<T> | '' | TNil> = TNullPropagation<
	T | Path,
	Path extends '' | TNil ? T
	: TObject<T> extends infer R ?
		Path extends keyof R ? R[Path]
		: Path extends `${infer K extends TIterate<R>}.${infer Rest}` ?
			Rest extends TPath<R[K]> ?
				TPathValue<R[K], Rest>
			:	never
		:	never
	:	never
>
```

Estende [`TPath`](object.md#tpath) — os membros herdados estão documentados lá.

---

## `TEntriesReturn`

tipo · [src/natives/object/types.ts:70](../../../src/natives/object/types.ts#L70)

The array of `[key, value]` tuples `Object.entries(value)` would produce for `T` — the return type of `ObjectUtils.entries`.

```ts
type TEntriesReturn<T> = { [K in TIterate<T, string>]: [K, T[K]]; }[TIterate<T, string>][]
```

---

## `TDiffAdd`

tipo · [src/natives/object/types.ts:75](../../../src/natives/object/types.ts#L75)

Diff entry: the value exists only on the right side.

```ts
type TDiffAdd<T> = ['ADDED', T]
```

---

## `TDiffRemoved`

tipo · [src/natives/object/types.ts:77](../../../src/natives/object/types.ts#L77)

Diff entry: the value exists only on the left side.

```ts
type TDiffRemoved<T> = ['REMOVED', T]
```

---

## `TDiffChanged`

tipo · [src/natives/object/types.ts:79](../../../src/natives/object/types.ts#L79)

Diff entry: both sides exist and differ.

```ts
type TDiffChanged<T, U> = ['CHANGED', T, U]
```

---

## `TDiffType`

tipo · [src/natives/object/types.ts:82](../../../src/natives/object/types.ts#L82)

Diff entry of two non-object values.

```ts
type TDiffType<T, U> =
TEquals<T, U> extends true ? TNil | TDiffChanged<T,U>
: TUnkown<T | U> extends never ? TDiffChanged<T, U>
: TUnkown<T> extends never ? TDiffRemoved<T>
: TDiffAdd<U>
```

Estende `true`.

---

## `TDiff`

tipo · [src/natives/object/types.ts:89](../../../src/natives/object/types.ts#L89)

Result type of a deep diff: objects keep their shape, leaves become diff entries.

```ts
type TDiff<T, U> =
T | U extends TObject<T | U> ?
	{
		[K in TIterate<T | U>]: TDiff<T[K], U[K]>;
	}
:	TDiffType<T, U>
```

Estende [`TObject`](object.md#tobject) — os membros herdados estão documentados lá.

---

## `TInternal`

tipo · [src/natives/object/types.ts:98](../../../src/natives/object/types.ts#L98)

Object carrying private state under the `INTERNAL` key.

```ts
type TInternal<T> = { … }
```

### Propriedades

#### `[INTERNAL]: T`

The private state.

---

## `isNull`

constante · [src/natives/object/utils.ts:99](../../../src/natives/object/utils.ts#L99)

Shortcuts for the `ObjectUtils` methods of the same name.

```ts
const isNull = ObjectUtils
```

---

## `isNullOrUndefined`

constante · [src/natives/object/utils.ts:99](../../../src/natives/object/utils.ts#L99)

Shortcuts for the `ObjectUtils` methods of the same name.

```ts
const isNullOrUndefined = ObjectUtils
```

---

## `json`

constante · [src/natives/object/utils.ts:99](../../../src/natives/object/utils.ts#L99)

Shortcuts for the `ObjectUtils` methods of the same name.

```ts
const json = ObjectUtils
```

---

## `isObject`

constante · [src/natives/object/utils.ts:99](../../../src/natives/object/utils.ts#L99)

Shortcuts for the `ObjectUtils` methods of the same name.

```ts
const isObject = ObjectUtils
```
