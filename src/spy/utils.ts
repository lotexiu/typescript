import { _Spy } from "./implementations";

/** Public static wrapper over `_Spy` — lightweight execution-time profiling. */
class SpyUtils {
	static readonly timeExecution = _Spy.timeExecution;
	static readonly benchmark = _Spy.benchmark;
}

export {
	SpyUtils
}