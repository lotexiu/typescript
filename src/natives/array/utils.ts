import { _Array } from "./implementations";

/** Public static wrapper over `_Array` — array helpers (currently a type-narrowing `includes` check). */
class ArrayUtils {
	static readonly includes = _Array.includes;
}

export {
	ArrayUtils
}
