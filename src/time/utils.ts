import { _Time } from "./implementations";

/** Public static wrapper over `_Time` — millisecond-duration formatting. */
class TimeUtils {
	static readonly convert = _Time.convert;
}

export {
	TimeUtils
}
