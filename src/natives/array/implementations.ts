
/**
 * @internal
*/
class _Array {
	/** Type-narrowing `Array.prototype.includes` — narrows `value` to the array's element type when true. */
	static includes<const T extends any[], U>(values: T, value: U): value is T[number] {
		return values.includes(value)
	}
}

export {
	_Array
}