/**
 * Recursively unwraps the "awaited" type of a type. Non-promise thenables should resolve to `never`. This emulates the behavior of `await`.
 *
 * @example
 * type AwaitedString = _Awaited<Promise<string>>; // string
 */
type TAwaited<T> = Awaited<T>;

/**
 * Marker for type position without inference.
 *
 * @example
 * type NoInferExample<T> = _NoInfer<T>;
 */
type TNoInfer<T> = NoInfer<T>;

/**
 * Removes null and undefined from T.
 *
 * @example
 * type NonNullableExample = _NonNullable<string | null | undefined>; // string
 */
type TNonNullable<T> = NonNullable<T>;

/**
 * Excludes from T the types that are assignable to U.
 *
 * @example
 * type ExcludeExample = _Exclude<'a' | 'b' | 'c', 'a'>; // 'b' | 'c'
 */
type TExclude<T, U> = Exclude<T, U>;

/**
 * Extracts from T the types that are assignable to U.
 *
 * @example
 * type ExtractExample = _Extract<'a' | 'b' | 'c', 'a' | 'b'>; // 'a' | 'b'
 */
type TExtract<T, U> = Extract<T, U>;

export type {
	TAwaited,
	TNoInfer,
	TNonNullable,
	TExclude,
	TExtract,
};
