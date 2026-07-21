import { _Number } from "./implementations";

/** Public static wrapper over `_Number` — raw-text-to-number parsing. */
class NumberUtils {
	static readonly parse = _Number.parse;
}

export {
	NumberUtils
}
