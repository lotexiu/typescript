# `natives/array`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TArray`](#tarray) | tipo | Thin alias over the built-in `Array<T>`. |
| [`TArrayLike`](#tarraylike) | tipo | Thin alias over the built-in `ArrayLike<T>`. |
| [`Tuple`](#tuple) | tipo | A read-only array, for parameters that accept tuples and arrays alike. |
| [`TPair`](#tpair) | tipo | A 2-tuple `[T, T2]`. |
| [`TExtractValues`](#textractvalues) | tipo | The union of every element type in a tuple/array `T`. |
| [`TArrayType`](#tarraytype) | tipo | Extracts an array type's element type — `never` if `T` isn't an array. |
| [`TValueOf`](#tvalueof) | tipo | The element type at `Index` in tuple `List` — `-1` means the last element. |
| [`TArrayRest`](#tarrayrest) | tipo | The remaining tuple elements of `A` after removing the leading elements shared with `B`. |
| [`TAsArray`](#tasarray) | tipo | `T` itself if it's already an array type, otherwise `never`. |
| [`TReverseArray`](#treversearray) | tipo | Reverses the element order of a tuple type. |
| [`TMap`](#tmap) | tipo | Maps a tuple type `List` to a new tuple type where each element is the value of `Path` in the corresponding element of `List`. |
| [`ArrayUtils`](#arrayutils) | classe | Array helpers that return new arrays and never mutate the input. |

---

## `TArray`

tipo · [src/natives/array/types.ts:4](../../../src/natives/array/types.ts#L4)

Thin alias over the built-in `Array<T>`.

```ts
type TArray<T = any> = Array<T>
```

---

## `TArrayLike`

tipo · [src/natives/array/types.ts:7](../../../src/natives/array/types.ts#L7)

Thin alias over the built-in `ArrayLike<T>`.

```ts
type TArrayLike<T> = ArrayLike<T>
```

---

## `Tuple`

tipo · [src/natives/array/types.ts:10](../../../src/natives/array/types.ts#L10)

A read-only array, for parameters that accept tuples and arrays alike.

```ts
type Tuple<T> = readonly T[]
```

---

## `TPair`

tipo · [src/natives/array/types.ts:13](../../../src/natives/array/types.ts#L13)

A 2-tuple `[T, T2]`.

```ts
type TPair<T = any, T2 = any> = [T, T2]
```

---

## `TExtractValues`

tipo · [src/natives/array/types.ts:16](../../../src/natives/array/types.ts#L16)

The union of every element type in a tuple/array `T`.

```ts
type TExtractValues<T extends readonly any[]> = T[number]
```

Estende `readonly`.

---

## `TArrayType`

tipo · [src/natives/array/types.ts:19](../../../src/natives/array/types.ts#L19)

Extracts an array type's element type — `never` if `T` isn't an array.

```ts
type TArrayType<T> = T extends (infer U)[] ? U : never
```

---

## `TValueOf`

tipo · [src/natives/array/types.ts:22](../../../src/natives/array/types.ts#L22)

The element type at `Index` in tuple `List` — `-1` means the last element.

```ts
type TValueOf<
	Index extends number,
	List extends any[]
> =
	Index extends -1
		? List extends [...infer Rest, infer Last] ? Last : never
		: List[Index]
```

Estende `number`.

---

## `TArrayRest`

tipo · [src/natives/array/types.ts:31](../../../src/natives/array/types.ts#L31)

The remaining tuple elements of `A` after removing the leading elements shared with `B`.

```ts
type TArrayRest< A extends any[], B extends any[] > = A extends [...B, ...infer Rest] ? Rest : never
```

Estende `any`.

---

## `TAsArray`

tipo · [src/natives/array/types.ts:37](../../../src/natives/array/types.ts#L37)

`T` itself if it's already an array type, otherwise `never`.

```ts
type TAsArray<T> = T extends any[] ? T : never
```

Estende `any`.

---

## `TReverseArray`

tipo · [src/natives/array/types.ts:40](../../../src/natives/array/types.ts#L40)

Reverses the element order of a tuple type.

```ts
type TReverseArray<T> = T extends [infer First, ...infer Rest] ? [...TReverseArray<Rest>, First] : T
```

---

## `TMap`

tipo · [src/natives/array/types.ts:43](../../../src/natives/array/types.ts#L43)

Maps a tuple type `List` to a new tuple type where each element is the value of `Path` in the corresponding element of `List`.

```ts
type TMap<List extends any[], Path extends TPath<List[number]>> = [...{
	[K in keyof List]: TPathValue<List[K], Path>
}]
```

Estende `any`.

---

## `ArrayUtils`

classe · [src/natives/array/utils.ts:2](../../../src/natives/array/utils.ts#L2)

Array helpers that return new arrays and never mutate the input.

```ts
class ArrayUtils
```

### Estáticos

#### `static groupBy<T, K extends PropertyKey>( array: readonly T[], keySelector: (item: T) => K ): Record<K, T[]>`

Groups items by the key `keySelector` returns, keeping their order inside each group.

#### `static uniqueBy<T, K>(array: readonly T[], keySelector: (item: T) => K): T[]`

Keeps the first item of each key returned by `keySelector`.

#### `static partition<T>(array: readonly T[], predicate: (item: T, index: number) => boolean): [T[], T[]]`

Splits into `[matching, rest]`, keeping the original order in both.

#### `static range(start: number, end: number, step = 1): number[]`

`[start, end)` stepping by `step` (default 1; negative steps count down).

#### `static zip<A, B>(first: readonly A[], second: readonly B[]): [A, B][]`

Pairs items by index; stops at the shortest array.

#### `static sortBy<T>( array: readonly T[], ...selectors: Array<{ key: (item: T) => any; order?: 'asc' | 'desc' }> ): T[]`

A sorted copy, by one or more `{ key, order }` selectors; later selectors break ties. `order` defaults to `asc`.

**Exemplo**

```ts
ArrayUtils.sortBy(people, { key: (person) => person.age, order: 'desc' }, { key: (person) => person.name })
```
