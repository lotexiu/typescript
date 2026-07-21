
/**
 * @internal
*/
class _Array {
	static includes<const T extends any[], U>(values: T, value: U): value is T[number] {
		return values.includes(value)
	}
}

export {
	_Array
}