import { _Global } from "./implementations";

/** Public static wrapper over `_Global` — registers method overrides directly onto a native prototype (e.g. `String.prototype`). */
class GlobalUtils {
	static register = _Global.register;
}

export {
	GlobalUtils
}
