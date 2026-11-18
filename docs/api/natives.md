# `natives`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TAwaited`](#tawaited) | tipo | Recursively unwraps the "awaited" type of a type. Non-promise thenables should resolve to `never`. This emulates the behavior of `await`. |
| [`TNoInfer`](#tnoinfer) | tipo | Marker for type position without inference. |
| [`TNonNullable`](#tnonnullable) | tipo | Removes null and undefined from T. |
| [`TExclude`](#texclude) | tipo | Excludes from T the types that are assignable to U. |
| [`TExtract`](#textract) | tipo | Extracts from T the types that are assignable to U. |

---

## `TAwaited`

tipo · [src/natives/types.ts:7](../../src/natives/types.ts#L7)

Recursively unwraps the "awaited" type of a type. Non-promise thenables should resolve to `never`. This emulates the behavior of `await`.

```ts
type TAwaited<T> = Awaited<T>
```

**Exemplo**

```ts
type AwaitedString = _Awaited<Promise<string>>; // string
```

---

## `TNoInfer`

tipo · [src/natives/types.ts:15](../../src/natives/types.ts#L15)

Marker for type position without inference.

```ts
type TNoInfer<T> = NoInfer<T>
```

**Exemplo**

```ts
type NoInferExample<T> = _NoInfer<T>;
```

---

## `TNonNullable`

tipo · [src/natives/types.ts:23](../../src/natives/types.ts#L23)

Removes null and undefined from T.

```ts
type TNonNullable<T> = NonNullable<T>
```

**Exemplo**

```ts
type NonNullableExample = _NonNullable<string | null | undefined>; // string
```

---

## `TExclude`

tipo · [src/natives/types.ts:31](../../src/natives/types.ts#L31)

Excludes from T the types that are assignable to U.

```ts
type TExclude<T, U> = Exclude<T, U>
```

**Exemplo**

```ts
type ExcludeExample = _Exclude<'a' | 'b' | 'c', 'a'>; // 'b' | 'c'
```

---

## `TExtract`

tipo · [src/natives/types.ts:39](../../src/natives/types.ts#L39)

Extracts from T the types that are assignable to U.

```ts
type TExtract<T, U> = Extract<T, U>
```

**Exemplo**

```ts
type ExtractExample = _Extract<'a' | 'b' | 'c', 'a' | 'b'>; // 'a' | 'b'
```
