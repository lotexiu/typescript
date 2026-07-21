import { TSameType, TUnkown } from "@ts/types";
import type { TPick } from "./types.native";

/** `T` narrowed to plain-object shapes only — `never` for functions, arrays, or non-objects. */
type TObject<T> = T extends Function
	? never
	: T extends readonly any[]
		? never
		: T extends object
			? T
			: never;

/** Builds an object type from a union of `[key, value]` tuples — the inverse of `TEntriesReturn`. */
type TRecord<T extends [any, any]> = {
	[P in T as P[0]]: P[1];
};

/** `T` with every nested property (recursively) made optional. */
type TDeepPartial<T> =
	TObject<T> extends never ? T : { [K in keyof T]?: TDeepPartial<T[K]> | T[K] };

/** The subset of `T`'s fields whose keys also exist on `U`. */
type TCommonFields<T, U> = TPick<T, Extract<keyof T, keyof U>>;

/** Every valid dot-separated path string into `T`, including nested object paths — used to type `valueFromPath`/`setValueFromPath`. */
type TPath<T> = {
	[K in keyof T & string]: TObject<T[K]> extends never
		? K
		: K | `${K}.${TPath<T[K]>}`;
}[keyof T & string];

/** Resolves the type found at a dot-separated `Path` string into `T` (the return type of `valueFromPath`). */
type TPathResolver<
	T,
	Path extends String,
> = Path extends `${infer Key}.${infer Rest}`
	? Key extends keyof T
		? TPathResolver<T[Key], Rest>
		: never
	: Path extends keyof T
		? T[Path]
		: never;

/** The `[key, value]` tuple union `Object.entries(value)` would produce for `T` — the return type of `ObjectUtils.entries`. */
type TEntriesReturn<T> = {
	[K in keyof T]: [K, T[K]];
}[keyof T];

type TKeyOfOptions<T> = {
	extract?: keyof T,
	exclude?: keyof T,
}

/** `keyof T`, optionally narrowed to just `extract` or with `exclude` removed. */
type TKeyOf<T, Options extends TKeyOfOptions<T> | null = null> =
	Options extends null
		? keyof T
		: Options extends { extract: infer E extends keyof T }
			? E
			: Options extends { exclude: infer E extends keyof T }
				? Exclude<keyof T, E>
				: never

type TIterableKeys<T> = T extends object ? keyof T & (string|number) : never

type Added<Path, Type> = { type: 'added', path: Path, b: Type }
type Removed<Path, Type> = { type: 'removed', path: Path, a: Type }
type Changed<Path, TypeA, TypeB> = { type: 'changed', path: Path, a: TypeA, b: TypeB }

/** Recursive structural diff between `A` and `B` — per key, `added`/`removed`/`changed` (or a nested `TDiffs` for nested objects). The return type of `ObjectUtils.diffs`. */
type TDiffs<A, B, Prefix extends string = ''> =
	TSameType<A,B> extends never
	? {
		[Key in TIterableKeys<A|B>]: 
				Key extends keyof A
					? Key extends keyof B
						? (A[Key]|B[Key]) extends TObject<A[Key]|B[Key]>
							? TDiffs<A[Key], B[Key], `${Prefix}${Key}.`>
							: Changed<`${Prefix}${Key}`, A[Key], B[Key]>
						: Removed<`${Prefix}${Key}`, A[Key]>
					: Key extends keyof B
						? Added<`${Prefix}${Key}`, B[Key]>
						: never
	}
	: never

export type {
	TObject,
	TRecord,
	TDeepPartial,
	TCommonFields,
	TPath,
	TPathResolver,
	TEntriesReturn,
	TKeyOf,
	TDiffs,
};
