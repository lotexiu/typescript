/** A single decimal digit literal type, `0`-`9`. */
type TDigit = 0|1|2|3|4|5|6|7|8|9;

type TNumberTypes = string | number;

/** Parses a numeric string/number literal type into its number literal type — `never` if `T` isn't numeric. */
type TNumber<T extends TNumberTypes> =  `${T}` extends `${infer R extends number}` ? R : never;

/** The absolute value of a numeric literal type, as a number literal type. */
type TAbs<T extends TNumberTypes> = `${T}` extends `-${infer R extends number}` ? R : TNumber<T>;

/** `T` itself if its literal value is negative, otherwise `never`. */
type TNegative<T extends TNumberTypes> = `${T}` extends `-${number}` ? T : never;

/** `T` itself if its literal value is non-negative, otherwise `never`. */
type TPositive<T extends TNumberTypes> = `${T}` extends `-${number}` ? never : T;

/** The arithmetic negation of a numeric literal type. */
type TNegate<T extends TNumberTypes> =
	TAbs<T> extends infer R
		? R extends TNumber<T>
			? TNumber<`-${R}`>
			: R
		: never;

/** Compares two single-digit literal types: `-1` (`A < B`), `0` (equal), or `1` (`A > B`), via a static lookup table. */
type TDigitCompare<
  A extends TDigit,
  B extends TDigit
> = [
// 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
	[0,-1,-1,-1,-1,-1,-1,-1,-1,-1], // 0
	[1, 0,-1,-1,-1,-1,-1,-1,-1,-1], // 1
	[1, 1, 0,-1,-1,-1,-1,-1,-1,-1], // 2
	[1, 1, 1, 0,-1,-1,-1,-1,-1,-1], // 3
	[1, 1, 1, 1, 0,-1,-1,-1,-1,-1], // 4
	[1, 1, 1, 1, 1, 0,-1,-1,-1,-1], // 5
	[1, 1, 1, 1, 1, 1, 0,-1,-1,-1], // 6
	[1, 1, 1, 1, 1, 1, 1, 0,-1,-1], // 7
	[1, 1, 1, 1, 1, 1, 1, 1, 0,-1], // 8
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 0], // 9
][A][B]

export {
	TDigit,
	TNumber,
	TAbs,
	TNegative,
	TPositive,
	TNegate,
	TDigitCompare,
};