
/** Reverses a string literal type character by character. */
type TReverseStr<T> =
	T extends `${infer First}${infer Rest}` 
		? `${TReverseStr<Rest>}${First}`
		: T;

export {
	TReverseStr,
};