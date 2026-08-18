import { TSameType } from "@ts/types";

/** Basic Non-object types (primitives, functions, and arrays). Used for filtering out non-object values. */
type TNonObject = String | Number | Boolean | BigInt | Symbol | null | undefined | Function | readonly any[];

/** `T` narrowed to plain-object shapes only — `never` for functions, arrays, or non-objects. */
type TObject<T> = Exclude<T, TNonObject> & object;

/** Keys of `T` that are iterable (string or number). */
type TIterate<T> = keyof T & (string | number)

type TKeyOfOptions<T> = {
	iterable?: boolean
	exclude?: keyof T,
}

/** Keys of `T` with optional filtering and iterable constraints. */
type TKeyOf<T, Options extends TKeyOfOptions<T> = {}> =
	{} extends Options
		? keyof T
		: Options['iterable'] extends true
			? unknown extends Options['exclude'] 
				? TIterate<T>
				: Exclude<TIterate<T>, Options['exclude']>
			: Exclude<keyof T, Options['exclude']>

/** Builds an object type from a union of `[key, value]` tuples — the inverse of `TEntriesReturn`. */
type TRecord<T extends [any, any]> = {
	[P in T as P[0]]: P[1];
};

/** The subset of `T`'s fields whose keys also exist on `U`. */
type TCommonFields<T, U> = keyof T & keyof U;

/** Keys of `T` that are recursive (i.e., their values are also of of type `T`). */
type TRecursiveKeys<T> = {
	[K in keyof T]: T[K] extends T ? K : never
}[keyof T];

/** `T` with every nested property (recursively) made optional. */
type TDeepPartial<T> = {
	[K in Exclude<keyof T, keyof Object>]?:
		T[K] extends infer R extends TObject<T[K]>
			? R extends T 
				? T 
				: TDeepPartial<R>
			: T[K]
}

/** Every valid dot-separated path string into `T`, including nested object paths — used to type `valueFromPath`/`setValueFromPath`. */
type TPath<T> = 
	TObject<T> extends never ? never :
	TObject<T> extends infer R 
		? {[K in TIterate<R>] : K | `${K}.${TPath<R[K]>}`}[TIterate<R>]
		: never

/** Resolves the type found at a dot-separated `Path` string into `T` (the return type of `valueFromPath`). */
type TPathValue<T, Path extends TPath<T>> = TObject<T> extends infer R 
	? Extract<T, null | undefined> | (
		Path extends keyof R
			? R[Path]
			: Path extends `${infer K extends TIterate<R>}.${infer Rest}`
				? Rest extends TPath<R[K]>
					? TPathValue<R[K], Rest>
					: never
				: never
	) : never;

/** The `[key, value]` tuple union `Object.entries(value)` would produce for `T` — the return type of `ObjectUtils.entries`. */
type TEntriesReturn<T> = {
	[K in keyof T]: [K, T[K]];
}[keyof T];

type TDiffTypes = ['REMOVED', any] | ['ADDED',any] | ['CHANGED', any, any]
interface TDiffObject {
	[K: string|number]: TDiffTypes | TDiffObject
}
type TDiffValues = TDiffTypes | TDiffObject;

type TDiff<A, B> =
  TSameType<A, B> extends false
		? A|B extends TObject<A|B> ? {
			[K in TIterate<A&B>]:
				K extends TIterate<A|B> ? TDiff<A[K], B[K]> :
				K extends TIterate<A> ? ['REMOVED', A[K]] :
				K extends TIterate<B> ? ['ADDED', B[K]] :
				never
		}
		: ['CHANGED', A, B]
	: never

export type {
	TNonObject,
	TObject,
	TIterate,
	TRecord,
	TDeepPartial,
	TCommonFields,
	TPath,
	TPathValue,
	TEntriesReturn,
	TKeyOf,
	TDiffValues,
	TDiff,
};
