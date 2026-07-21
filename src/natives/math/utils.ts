import { _Math } from "./implementations";

/** Public static wrapper over `_Math` — basic numeric helpers (currently just clamping to a range). */
class MathUtils {
	static readonly clamp = _Math.clamp;
}

export {
	MathUtils
}
