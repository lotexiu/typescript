import { TEquals, TNil, TNullPropagation, TUnkown } from '@ts/types';
import { TPair } from '@tsn-array/types';

type TNonObject =
	String | Number | Boolean | BigInt | Symbol | null | undefined | Function | readonly any[];

/** `T` narrowed to plain-object shapes only — `never` for functions, arrays, or non-objects. */
type TObject<T> = Exclude<T, TNonObject> & object;

type TIterKeyType = string | number;

/** Keys of `T` that are iterable (string or number). */
type TIterate<T, KeyTypes extends TIterKeyType = TIterKeyType> =
	T extends never ? never : keyof T & KeyTypes;

type TKeyOf<T, KeyTypes = PropertyKey, RemoveKey = never> = Exclude<keyof T & KeyTypes, RemoveKey>;

/** Builds an object type from a union of `[key, value]` tuples — the inverse of `TEntriesReturn`. */
type TRecord<T extends TPair = TPair> = {
	[P in T as P[0]]: P[1];
};

/** The subset of `T`'s fields whose keys also exist on `U`. */
type TCommonFields<T, U> = keyof T & keyof U;

type TKeysType<T, U> = {
	[K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

type TMethodKey<T> = TKeysType<T, Function>;

/** `T` with every nested property (recursively) made optional. */
type TDeepPartial<T> = {
	[K in Exclude<keyof T, keyof Object>]?: T[K] extends infer R extends TObject<T[K]> ?
		R extends T ?
			T
		:	TDeepPartial<R>
	:	T[K];
};

/** Every valid dot-separated path string into `T`, including nested object paths — used to type `valueFromPath`/`setValueFromPath`. */
type TPath<T, AsT = '' | TNil> =
	TObject<T> extends infer R ?
		{
			[K in TIterate<R>]: AsT | K | `${K}.${TPath<R[K], never>}`;
		}[TIterate<R>]
	:	never;

/** Resolves the type found at a dot-separated `Path` string into `T` (the return type of `valueFromPath`). */
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
>;

/** The array of `[key, value]` tuples `Object.entries(value)` would produce for `T` — the return type of `ObjectUtils.entries`. */
type TEntriesReturn<T> = {
	[K in TIterate<T, string>]: [K, T[K]];
}[TIterate<T, string>][];

type TDiffAdd<T> = ['ADDED', T];
type TDiffRemoved<T> = ['REMOVED', T];
type TDiffChanged<T, U> = ['CHANGED', T, U];

type TDiffType<T, U> =
	TEquals<T, U> extends true ? TNil | TDiffChanged<T,U>
	: TUnkown<T | U> extends never ? TDiffChanged<T, U>
	: TUnkown<T> extends never ? TDiffRemoved<T>
	: TDiffAdd<U>;

type TDiff<T, U> =
	T | U extends TObject<T | U> ?
		{
			[K in TIterate<T | U>]: TDiff<T[K], U[K]>;
		}
	:	TDiffType<T, U>;

export type {
	TNonObject,
	TObject,
	TIterKeyType,
	TIterate,
	TKeyOf,
	TRecord,
	TCommonFields,
	TKeysType,
	TMethodKey,
	TDeepPartial,
	TPath,
	TPathValue,
	TEntriesReturn,
	TDiffAdd,
	TDiffRemoved,
	TDiffChanged,
	TDiffType,
	TDiff,
};
