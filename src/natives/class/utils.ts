import { TAbstractConstructor } from "@tsn-function/types";

class ClassUtils {
	/** Type-safe `instanceof` check — narrows `obj` to `T` when it's an instance of `constructor`. */
	static instanceOf<T>(obj: any, constructor: TAbstractConstructor<T>): obj is T {
		return obj instanceof constructor;
	}
}

export { ClassUtils };
