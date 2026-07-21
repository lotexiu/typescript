[← Voltar para PROJECT.md](../PROJECT.md)

# natives/array

<a id="_Array"></a>
#### [`_Array`](../../src/natives/array/implementations.ts#L5) _(class)_

- `@internal`

<a id="TArray"></a>
#### [`TArray`](../../src/natives/array/types.ts#L4) _(type, type-only)_

Thin alias over the built-in `Array<T>`.

<a id="TArrayLike"></a>
#### [`TArrayLike`](../../src/natives/array/types.ts#L7) _(type, type-only)_

Thin alias over the built-in `ArrayLike<T>`.

<a id="TExtractValues"></a>
#### [`TExtractValues`](../../src/natives/array/types.ts#L10) _(type, type-only)_

The union of every element type in a tuple/array `T`.

<a id="TArrayType"></a>
#### [`TArrayType`](../../src/natives/array/types.ts#L13) _(type, type-only)_

Extracts an array type's element type — `never` if `T` isn't an array.

<a id="TValueOf"></a>
#### [`TValueOf`](../../src/natives/array/types.ts#L16) _(type, type-only)_

The element type at `Index` in tuple `List` — `-1` means the last element.

<a id="TArrayOptions"></a>
#### [`TArrayOptions`](../../src/natives/array/types.ts#L25) _(type, type-only)_

Options bag for `TArrayOf`: an explicit args tuple and/or a type to infer the rest of the array as.

<a id="TArrayRest"></a>
#### [`TArrayRest`](../../src/natives/array/types.ts#L31) _(type, type-only)_

The remaining tuple elements of `A` after removing the leading elements shared with `B`.

<a id="TArrayOf"></a>
#### [`TArrayOf`](../../src/natives/array/types.ts#L37) _(type, type-only)_

Builds a parameter-list-like tuple type from `TArrayOptions` — used to shape `TFn`'s argument list.

<a id="TPair"></a>
#### [`TPair`](../../src/natives/array/types.ts#L47) _(type, type-only)_

A 2-tuple `[T, T2]`.

<a id="TAsArray"></a>
#### [`TAsArray`](../../src/natives/array/types.ts#L50) _(type, type-only)_

`T` itself if it's already an array type, otherwise `never`.

<a id="TReverseArray"></a>
#### [`TReverseArray`](../../src/natives/array/types.ts#L53) _(type, type-only)_

Reverses the element order of a tuple type.

<a id="ArrayUtils"></a>
#### [`ArrayUtils`](../../src/natives/array/utils.ts#L4) _(class)_

Public static wrapper over `_Array` — array helpers (currently a type-narrowing `includes` check).
