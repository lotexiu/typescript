import { TPath, TPathValue } from "@tsn-object/types";

/** Thin alias over the built-in `Array<T>`. */
type TArray<T = any> = Array<T>;

/** Thin alias over the built-in `ArrayLike<T>`. */
type TArrayLike<T> = ArrayLike<T>;

type Tuple<T> = readonly T[]

/** A 2-tuple `[T, T2]`. */
type TPair<T = any, T2 = any> = [T, T2]; 

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

/** `T` itself if it's already an array type, otherwise `never`. */
type TAsArray<T> = T extends any[] ? T : never;

/** Reverses the element order of a tuple type. */
type TReverseArray<T> = T extends [infer First, ...infer Rest] ? [...TReverseArray<Rest>, First] : T;

/** Maps a tuple type `List` to a new tuple type where each element is the value of `Path` in the corresponding element of `List`. */
type TMap<List extends any[], Path extends TPath<List[number]>> = [...{
	[K in keyof List]: TPathValue<List[K], Path>
}]

export type {
	TArray,
	TArrayLike,
	Tuple,
	TPair,
	TExtractValues,
	TArrayType,
	TValueOf,
	TAsArray,
	TReverseArray,
	TArrayRest,
	TMap,
};
