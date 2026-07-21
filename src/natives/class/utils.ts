import { _Class } from "./implementations";

/** Public static wrapper over `_Class` — instance/constructor type-narrowing check. */
class ClassUtils {
	static instanceOf = _Class.instanceOf
}

export {
	ClassUtils
}