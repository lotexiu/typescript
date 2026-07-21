[← Voltar para PROJECT.md](../PROJECT.md)

# natives

<a id="TAwaited"></a>
#### [`TAwaited`](../../src/natives/types.ts#L7) _(type, type-only)_

Recursively unwraps the "awaited" type of a type. Non-promise thenables should resolve to `never`. This emulates the behavior of `await`.

- `@example` type AwaitedString = _Awaited<Promise<string>>; // string

<a id="TNoInfer"></a>
#### [`TNoInfer`](../../src/natives/types.ts#L15) _(type, type-only)_

Marker for type position without inference.

- `@example` type NoInferExample<T> = _NoInfer<T>;

<a id="TNonNullable"></a>
#### [`TNonNullable`](../../src/natives/types.ts#L23) _(type, type-only)_

Removes null and undefined from T.

- `@example` type NonNullableExample = _NonNullable<string | null | undefined>; // string

<a id="TExclude"></a>
#### [`TExclude`](../../src/natives/types.ts#L31) _(type, type-only)_

Excludes from T the types that are assignable to U.

- `@example` type ExcludeExample = _Exclude<'a' | 'b' | 'c', 'a'>; // 'b' | 'c'

<a id="TExtract"></a>
#### [`TExtract`](../../src/natives/types.ts#L39) _(type, type-only)_

Extracts from T the types that are assignable to U.

- `@example` type ExtractExample = _Extract<'a' | 'b' | 'c', 'a' | 'b'>; // 'a' | 'b'
