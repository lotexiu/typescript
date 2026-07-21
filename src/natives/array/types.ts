import type { TUnkown } from "@ts/types";

/** Thin alias over the built-in `Array<T>`. */
type TArray<T = any> = Array<T>;

/** Thin alias over the built-in `ArrayLike<T>`. */
type TArrayLike<T> = ArrayLike<T>;

/** The union of every element type in a tuple/array `T`. */
type TExtractValues<T extends readonly any[]> = T[number];

/** Extracts an array type's element type — `never` if `T` isn't an array. */
type TArrayType<T> = T extends (infer U)[] ? U : never;

/** The element type at `Index` in tuple `List` — `-1` means the last element. */
type TValueOf<
	Index extends number,
	List extends any[]
> =
	Index extends -1
		? List extends [...infer Rest, infer Last] ? Last : never
		: List[Index];

/** Options bag for `TArrayOf`: an explicit args tuple and/or a type to infer the rest of the array as. */
type TArrayOptions = {
	args?: any[]
	infAs?: any
}

/** The remaining tuple elements of `A` after removing the leading elements shared with `B`. */
type TArrayRest<
	A extends any[],
	B extends any[]
> = A extends [...B, ...infer Rest] ? Rest : never;

/** Builds a parameter-list-like tuple type from `TArrayOptions` — used to shape `TFn`'s argument list. */
type TArrayOf<Option extends TArrayOptions> =
	TUnkown<Option['args']> extends never
		? TUnkown<Option['infAs']> extends never
			? [...Exclude<Option['args'], undefined>, ...Option['infAs'][]]
			: [...Exclude<Option['args'], undefined>]
		: TUnkown<Option['infAs']> extends never
			? Option['infAs'][]
			: never

/** A 2-tuple `[T, T2]`. */
type TPair<T = any, T2 = any> = [T, T2];

/** `T` itself if it's already an array type, otherwise `never`. */
type TAsArray<T> = T extends any[] ? T : never;

/** Reverses the element order of a tuple type. */
type TReverseArray<T> = T extends [infer First, ...infer Rest] ? [...TReverseArray<Rest>, First] : T;

export type {
	TArray,
	TArrayLike,
	TExtractValues,
	TArrayType,
	TValueOf,
	TArrayOptions,
	TArrayOf,
	TPair,
	TAsArray,
	TReverseArray,
	TArrayRest,
};
