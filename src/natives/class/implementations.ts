import { TConstructor } from "@ts/index";

/**
 * @internal
 */
class _Class {
	/** Type-safe `instanceof` check — narrows `obj` to `T` when it's an instance of `constructor`. */
	static instanceOf<T>(obj: any, constructor: TConstructor<T>): obj is T {
		return obj instanceof constructor;
	}
}

const {
	instanceOf
} = _Class


export {
	_Class,
	instanceOf
}