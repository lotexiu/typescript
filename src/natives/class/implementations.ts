import { TConstructor } from "@ts/index";


/** Type-safe `instanceof` check — narrows `obj` to `T` when it's an instance of `constructor`. */
function instanceOf<T>(obj: any, constructor: TConstructor<T>): obj is T {
	return obj instanceof constructor;
}

export {
	instanceOf
}