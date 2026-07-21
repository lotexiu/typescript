import { _Date } from "./implementations";

/** Public static wrapper over `_Date` — strict date parsing. */
class DateUtils {
	static readonly parseISO = _Date.parseISO;
}

export {
	DateUtils
}
