import { TDebounceFn, TOnceFn, TStepFn, TThrottleFn } from "./types";
import { DEFAULT_DEBOUNCE_DURATION, DEFAULT_STEP_AMOUNT, DEFAULT_THROTTLE_INTERVAL } from "./declarations";
import { TFn, TParameters } from "@tsn-function/types";
import { Timeout } from "@tsn-class/declarations";

/** Delays calling `fn` until `delay` ms have passed with no further calls — each call reschedules with the latest arguments. */
function debounce<T extends TFn>(fn: T, delay: number = DEFAULT_DEBOUNCE_DURATION): TDebounceFn<T> {
	let timeoutId: Timeout | undefined;
	function handler(this: any, ...args: TParameters<T>) {
		if (timeoutId !== undefined) clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			timeoutId = undefined;
			fn.apply(this, args);
		}, delay);
	}
	handler.clear = () => {
		if (timeoutId !== undefined) clearTimeout(timeoutId);
		timeoutId = undefined;
	}
	return handler as any;
}

/** Calls `fn` immediately, then ignores further calls until `interval` ms have passed. */
function throttle<T extends TFn>(fn: T, interval: number = DEFAULT_THROTTLE_INTERVAL): TThrottleFn<T> {
	let lastTime = 0;
	function handler(this: any, ...args: any[]) {
		const now = Date.now();
		if (now - lastTime >= interval) {
			fn.apply(this, args);
			lastTime = now;
		}
	}
	handler.clear = () => { lastTime = 0 }
	return handler as any;
}

/** Calls `fn` every `amount` calls (resetting the counter afterwards unless `autoClear` is `false`). */
function step<T extends TFn>(fn: T, amount: number = DEFAULT_STEP_AMOUNT, autoClear: boolean = true): TStepFn<T> {
	let counter = 0;
	function handler(this: any, ...args: any[]) {
		counter++;
		if (counter >= amount) {
			fn.apply(this, args);
			if (autoClear) counter = 0;
		}
	}
	handler.clear = () => { counter = 0 }
	return handler as any;
}

/** Calls `fn` at most once — every call after the first is a no-op until `clear()` resets it. */
function once<T extends TFn>(fn: T): TOnceFn<T> {
	let runned = false;
	function handler(this: any, ...args: any[]) {
		if (runned) return;
		fn.apply(this, args);
		runned = true;
	}
	handler.clear = () => { runned = false }
	return handler as any;
}

export {
	debounce,
	throttle,
	step,
	once
}