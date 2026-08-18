type TStrForEeachCallback = (char: string, index: number) => void | false

/** Reverses a string literal type character by character. */
type TReverseStr<T> =
	T extends `${infer First}${infer Rest}` 
		? `${TReverseStr<Rest>}${First}`
		: T;

type TStrToUnion<T extends string> =
	string extends T
		? string
		: T extends `${infer First}${infer Rest}`
			? First | TStrToUnion<Rest> 
			: never;

type TStrToArray<T extends string> =
	T extends `${infer First}${infer Rest}`
		? [First, ...TStrToArray<Rest>]
		: [];

export {
	TStrForEeachCallback,
	TReverseStr,
	TStrToUnion,
	TStrToArray,
};