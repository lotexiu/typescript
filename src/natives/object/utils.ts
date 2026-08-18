import { _Object } from "./implementations";


/** Public static wrapper over `_Object` — object/path/diff helpers (path-based get/set, shallow merge, entries, null checks, safe JSON, structural diff). */
class ObjectUtils {
	static readonly valueFromPath = _Object.valueFromPath;
	static readonly setValueFromPath = _Object.setValueFromPath;
	static readonly update = _Object.update;
	static readonly entries = _Object.entries;
	static readonly isNullOrUndefined = _Object.isNullOrUndefined;
	static readonly isObjectLike = _Object.isObject;
	static readonly json = _Object.json;
	static readonly isNull = _Object.isNull;
	static readonly diffs = _Object.diff;
}

export {
	ObjectUtils
}