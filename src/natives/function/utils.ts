import { Timeout } from '@tsn-class/declarations';
import {
	TDebounceFn,
	TFn,
	TFnDeclaration,
	TMemoizeFn,
	TOnceFn,
	TParameters,
	TScheduleOnceFn,
	TStepFn,
	TThrottleFn,
} from './types';

class FunctionUtils {
	/** Wraps `fn` so its `this` is passed as an explicit leading parameter instead of the calling context. */
	static thisAsParameter(fn: TFn): TFn {
		return function (this: any, ...args: any[]): any {
			return fn.call(null, this, ...args);
		};
	}

	static rebind<Applied extends any[], Rest extends any[], Return>(
		fn: TFn<[...Applied, ...Rest], Return>,
		thisArg: any,
		...args: Applied
	): TFn<Rest, Return> {
		function rebinded(...nextArgs: Rest): Return {
			return rebinded.children.call(thisArg, ...args, ...nextArgs);
		}
		rebinded.origin = fn.origin ?? fn;
		rebinded.children = fn;
		return rebinded;
	}

	/** Delays calling `fn` until `delay` ms have passed with no further calls — each call reschedules with the latest arguments. */
	static debounce<Args extends any[]>(fn: TFn<Args>, delay: number = 50): TDebounceFn<Args> {
		let timeoutId: Timeout | undefined;
		function handler(this: any, ...args: Args) {
			if (timeoutId !== undefined) clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				timeoutId = undefined;
				fn.apply(this, args);
			}, delay);
		}
		handler.clear = () => {
			if (timeoutId !== undefined) clearTimeout(timeoutId);
			timeoutId = undefined;
		};
		return handler;
	}

	static leadingDebounce<Args extends any[]>(fn: TFn<Args>, delay: number): TFn<Args, void> {
		let timeoutId: Timeout | undefined;
		return function handler(this: any, ...args: Args) {
			const callNow = timeoutId === undefined;
			if (timeoutId !== undefined) clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				timeoutId = undefined;
			}, delay);
			if (callNow) fn.apply(this, args);
		};
	}

	/** Calls `fn` immediately, then ignores further calls until `interval` ms have passed. */
	static throttle<Args extends any[]>(
		fn: TFn<Args, void>,
		interval: number = 50
	): TThrottleFn<Args> {
		let lastTime = 0;
		function handler(this: any, ...args: Args) {
			const now = Date.now();
			if (now - lastTime >= interval) {
				fn.apply(this, args);
				lastTime = now;
			}
		}
		handler.clear = () => {
			lastTime = 0;
		};
		return handler;
	}

	/** Calls `fn` every `amount` calls (resetting the counter afterwards unless `autoClear` is `false`). */
	static step<Args extends any[]>(
		fn: TFn<Args, void>,
		amount: number = 10,
		autoClear: boolean = true
	): TStepFn<Args> {
		let counter = 0;
		function handler(this: any, ...args: Args) {
			counter++;
			if (counter >= amount) {
				fn.apply(this, args);
				if (autoClear) counter = 0;
			}
		}
		handler.clear = () => {
			counter = 0;
		};
		return handler;
	}

	/** Calls `fn` at most once — every call after the first is a no-op until `clear()` resets it. */
	static once<Args extends any[]>(fn: TFn<[...Args], void>): TOnceFn<Args> {
		let runned = false;
		function handler(this: any, ...args: Args) {
			if (runned) return;
			fn.apply(this, args);
			runned = true;
		}
		handler.clear = () => {
			runned = false;
		};
		return handler;
	}

	static memoize<Args extends any[], Return>(
		fn: TFn<Args, Return>,
		keyResolver?: (...args: Args) => string
	): TMemoizeFn<Args, Return> {
		const cache = new Map<string, any>();
		function handler(this: any, ...args: Args) {
			const key = keyResolver ? keyResolver(...args) : JSON.stringify(args);
			if (cache.has(key)) return cache.get(key);
			const result = fn.apply(this, args);
			cache.set(key, result);
			return result;
		}
		handler.cache = cache;
		return handler;
	}

	static curry(fn: TFn): TFn {
		return function curried(this: any, ...args: any[]) {
			if (args.length >= fn.length) {
				return fn.apply(this, args);
			}
			return (...nextArgs: any[]) => curried.apply(this, args.concat(nextArgs));
		};
	}

	/** Coalesces calls within the same microtask into a single `fn()` run. `clear()` cancels a pending run, `flush()` runs it immediately instead of waiting for the microtask. */
	static scheduleOnce(fn: () => void): TScheduleOnceFn {
		let scheduled = false;
		function handler() {
			if (!scheduled) {
				scheduled = true;
				queueMicrotask(() => {
					if (!scheduled) return;
					scheduled = false;
					fn();
				});
			}
		}
		handler.clear = () => {
			scheduled = false;
		};
		handler.flush = () => {
			if (!scheduled) return;
			scheduled = false;
			fn();
		};
		return handler;
	}
}

export { FunctionUtils };
