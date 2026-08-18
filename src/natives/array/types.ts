import type { TSameType, TUnkown } from "@ts/types";

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
		
/** The remaining tuple elements of `A` after removing the leading elements shared with `B`. */
type TArrayRest<
	A extends any[],
	B extends any[]
> = A extends [...B, ...infer Rest] ? Rest : never;

type TArrayOf<Args extends any[] = never, InfType = never> =
	TSameType<Args|InfType,never> extends true 
		? [] 
		: Args extends never ? [...InfType[]]
		: [...(Args), ...(InfType|undefined)[]] 
	
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
	TArrayOf,
	TPair,
	TAsArray,
	TReverseArray,
	TArrayRest,
};
