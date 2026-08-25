/** `size` is the grapheme's UTF-16 code unit width — 1 for BMP characters, 2+ for surrogate pairs/ZWJ sequences. */
type TStrForEeachCallback = (char: string, index: number, size: number) => void | false

/** `size` is the matched character's UTF-16 code unit width — 1 for BMP, 2 for an astral code point. */
type TStrOnCharCallback = (index: number, size: number) => void | false

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
	TStrOnCharCallback,
	TReverseStr,
	TStrToUnion,
	TStrToArray,
};