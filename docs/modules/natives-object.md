[← Voltar para PROJECT.md](../PROJECT.md)

# natives/object

<a id="_Object"></a>
#### [`_Object`](../../src/natives/object/implementations.ts#L7) _(class)_

- `@internal`

<a id="keys"></a>
#### [`keys`](../../src/natives/object/implementations.ts#L22) _(const)_

<a id="seen"></a>
#### [`seen`](../../src/natives/object/implementations.ts#L49) _(const)_

<a id="result"></a>
#### [`result`](../../src/natives/object/implementations.ts#L72) _(const)_

<a id="keys"></a>
#### [`keys`](../../src/natives/object/implementations.ts#L73) _(const)_

<a id="aVal"></a>
#### [`aVal`](../../src/natives/object/implementations.ts#L75) _(const)_

<a id="bVal"></a>
#### [`bVal`](../../src/natives/object/implementations.ts#L76) _(const)_

<a id="path"></a>
#### [`path`](../../src/natives/object/implementations.ts#L77) _(const)_

<a id="isNull"></a>
#### [`isNull`](../../src/natives/object/implementations.ts#L98) _(const)_

Whether `value` is `null`/`undefined`, or strictly equals one of the given `nullValues`.

<a id="isNullOrUndefined"></a>
#### [`isNullOrUndefined`](../../src/natives/object/implementations.ts#L100) _(const)_

Whether `value` is `null` or `undefined`.

<a id="json"></a>
#### [`json`](../../src/natives/object/implementations.ts#L102) _(const)_

`JSON.stringify` that safely drops circular references (as `undefined`) instead of throwing.

<a id="TRequired"></a>
#### [`TRequired`](../../src/natives/object/types.native.ts#L9) _(type, type-only)_

Makes all properties of T required.

- `@example` type RequiredExample = _Required<{ a?: number; b?: string }>; // { a: number; b: string }

<a id="TReadonly"></a>
#### [`TReadonly`](../../src/natives/object/types.native.ts#L17) _(type, type-only)_

Makes all properties of T readonly.

- `@example` type ReadonlyExample = _Readonly<{ a: number; b?: string }>; // { readonly a: number; readonly b: string }

<a id="TPick"></a>
#### [`TPick`](../../src/natives/object/types.native.ts#L25) _(type, type-only)_

From T, picks a set of properties whose keys are in the union K.

- `@example` type PickExample = _Pick<{ a: number; b: string }, 'a'>; // { a: number }

<a id="TOmit"></a>
#### [`TOmit`](../../src/natives/object/types.native.ts#L35) _(type, type-only)_

Constructs a type with the properties of T except for those in type K.

- `@example` type OmitExample = _Omit<{ a: number; b: string }, 'a'>; // { b: string }

<a id="TPartial"></a>
#### [`TPartial`](../../src/natives/object/types.native.ts#L43) _(type, type-only)_

Makes all properties of T optional.

- `@example` type PartialExample = _Partial<{ a: number; b: string }>; // { a?: number; b?: string }

<a id="TObject"></a>
#### [`TObject`](../../src/natives/object/types.ts#L5) _(type, type-only)_

`T` narrowed to plain-object shapes only — `never` for functions, arrays, or non-objects.

<a id="TRecord"></a>
#### [`TRecord`](../../src/natives/object/types.ts#L14) _(type, type-only)_

Builds an object type from a union of `[key, value]` tuples — the inverse of `TEntriesReturn`.

<a id="TDeepPartial"></a>
#### [`TDeepPartial`](../../src/natives/object/types.ts#L19) _(type, type-only)_

`T` with every nested property (recursively) made optional.

<a id="TCommonFields"></a>
#### [`TCommonFields`](../../src/natives/object/types.ts#L23) _(type, type-only)_

The subset of `T`'s fields whose keys also exist on `U`.

<a id="TPath"></a>
#### [`TPath`](../../src/natives/object/types.ts#L26) _(type, type-only)_

Every valid dot-separated path string into `T`, including nested object paths — used to type `valueFromPath`/`setValueFromPath`.

<a id="TPathResolver"></a>
#### [`TPathResolver`](../../src/natives/object/types.ts#L33) _(type, type-only)_

Resolves the type found at a dot-separated `Path` string into `T` (the return type of `valueFromPath`).

<a id="TEntriesReturn"></a>
#### [`TEntriesReturn`](../../src/natives/object/types.ts#L45) _(type, type-only)_

The `[key, value]` tuple union `Object.entries(value)` would produce for `T` — the return type of `ObjectUtils.entries`.

<a id="TKeyOfOptions"></a>
#### [`TKeyOfOptions`](../../src/natives/object/types.ts#L49) _(type, type-only)_

<a id="TKeyOf"></a>
#### [`TKeyOf`](../../src/natives/object/types.ts#L55) _(type, type-only)_

`keyof T`, optionally narrowed to just `extract` or with `exclude` removed.

<a id="TIterableKeys"></a>
#### [`TIterableKeys`](../../src/natives/object/types.ts#L64) _(type, type-only)_

<a id="Added"></a>
#### [`Added`](../../src/natives/object/types.ts#L66) _(type, type-only)_

<a id="Removed"></a>
#### [`Removed`](../../src/natives/object/types.ts#L67) _(type, type-only)_

<a id="Changed"></a>
#### [`Changed`](../../src/natives/object/types.ts#L68) _(type, type-only)_

<a id="TDiffs"></a>
#### [`TDiffs`](../../src/natives/object/types.ts#L71) _(type, type-only)_

Recursive structural diff between `A` and `B` — per key, `added`/`removed`/`changed` (or a nested `TDiffs` for nested objects). The return type of `ObjectUtils.diffs`.

<a id="ObjectUtils"></a>
#### [`ObjectUtils`](../../src/natives/object/utils.ts#L5) _(class)_

Public static wrapper over `_Object` — object/path/diff helpers (path-based get/set, shallow merge, entries, null checks, safe JSON, structural diff).
