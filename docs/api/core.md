# `core`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TTypeOfValue`](#ttypeofvalue) | tipo | Strings `typeof` can return. |
| [`TPrimitiveTypes`](#tprimitivetypes) | tipo | Wrapper types of the primitives. |
| [`TNil`](#tnil) | tipo | `null` or `undefined`. |
| [`TFalse`](#tfalse) | tipo | Falsy values. |
| [`TEmpty`](#tempty) | tipo | Falsy values plus empty object and array. |
| [`TNullPropagation`](#tnullpropagation) | tipo | `Result`, or `null`/`undefined` when `WeakType` can be one of them. |
| [`TNullable`](#tnullable) | tipo | The type or `null`/`undefined`. |
| [`TNonUndefined`](#tnonundefined) | tipo | The type without `undefined`. |
| [`TNotUnkown`](#tnotunkown) | tipo | The type when it has keys, `never` otherwise. |
| [`TUnkown`](#tunkown) | tipo | The type when it has no keys, `never` otherwise. |
| [`TAs`](#tas) | tipo | `T` narrowed/cast to `T & U` when `T` is assignable to `U`, otherwise `never`. |
| [`TEquals`](#tequals) | tipo | `true` when `A` and `B` are exactly the same type. |

---

## `TTypeOfValue`

tipo · [src/types.ts:6](../../src/types.ts#L6)

Strings `typeof` can return.

```ts
type TTypeOfValue = typeof _typeof
```

---

## `TPrimitiveTypes`

tipo · [src/types.ts:9](../../src/types.ts#L9)

Wrapper types of the primitives.

```ts
type TPrimitiveTypes =
| String
| Number
| Boolean
| BigInt
| Symbol
| Function
| null
| undefined
| object
| readonly any[]
```

---

## `TNil`

tipo · [src/types.ts:22](../../src/types.ts#L22)

`null` or `undefined`.

```ts
type TNil = null | undefined
```

---

## `TFalse`

tipo · [src/types.ts:25](../../src/types.ts#L25)

Falsy values.

```ts
type TFalse = TNil | '' | 0 | false
```

---

## `TEmpty`

tipo · [src/types.ts:28](../../src/types.ts#L28)

Falsy values plus empty object and array.

```ts
type TEmpty = TFalse | {} | []
```

---

## `TNullPropagation`

tipo · [src/types.ts:31](../../src/types.ts#L31)

`Result`, or `null`/`undefined` when `WeakType` can be one of them.

```ts
type TNullPropagation<WeakType, Result> = Extract<WeakType, TNil> | Result
```

---

## `TNullable`

tipo · [src/types.ts:34](../../src/types.ts#L34)

The type or `null`/`undefined`.

```ts
type TNullable<Type = null> = Type | TNil
```

---

## `TNonUndefined`

tipo · [src/types.ts:37](../../src/types.ts#L37)

The type without `undefined`.

```ts
type TNonUndefined<T> = TExclude<T, undefined>
```

---

## `TNotUnkown`

tipo · [src/types.ts:40](../../src/types.ts#L40)

The type when it has keys, `never` otherwise.

```ts
type TNotUnkown<T> = keyof T extends never ? never : T
```

Estende `never`.

---

## `TUnkown`

tipo · [src/types.ts:43](../../src/types.ts#L43)

The type when it has no keys, `never` otherwise.

```ts
type TUnkown<T> = keyof T extends never ? T : never
```

Estende `never`.

---

## `TAs`

tipo · [src/types.ts:46](../../src/types.ts#L46)

`T` narrowed/cast to `T & U` when `T` is assignable to `U`, otherwise `never`.

```ts
type TAs<T, U> = T extends U ? T & U : never
```

Estende `U`.

---

## `TEquals`

tipo · [src/types.ts:49](../../src/types.ts#L49)

`true` when `A` and `B` are exactly the same type.

```ts
type TEquals<A, B> = A extends B ? B extends A ? true : false : false
```

Estende `B`.
