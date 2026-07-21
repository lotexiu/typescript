import { TFn } from "@tsn-function/types"

/** The wrapped function `debounce()` returns — callable like `T`, plus `clear()` to cancel a pending call. */
type TDebounceFn<T extends  TFn> =  T & {
	clear: () => void
}

/** The wrapped function `throttle()` returns — callable like `T`, plus `clear()` to reset its interval tracking. */
type TThrottleFn<T extends  TFn> =  T & {
	clear: () => void
}

/** The wrapped function `step()` returns — callable like `T`, plus `clear()` to reset its call counter. */
type TStepFn<T extends  TFn> =  T & {
	clear: () => void
}

/** The wrapped function `once()` returns — callable like `T`, plus `clear()` to allow it to run again. */
type TOnceFn<T extends  TFn> =  T & {
	clear: () => void
}

export {
	TDebounceFn,
	TThrottleFn,
	TStepFn,
	TOnceFn,
}
