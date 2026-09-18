import { Timeout } from '@tsn-class/declarations';
import { TDebounceFn, TFn, TFnDeclaration, TOnceFn, TParameters, TStepFn, TThrottleFn } from './types';

class FunctionUtils {
	/** Wraps `fn` so its `this` is passed as an explicit leading parameter instead of the calling context. */
	static thisAsParameter<T extends TFn>(fn: T): TFnDeclaration<T> {
		return function (this: any, ...args: any[]): any {
			return fn.call(null, this, ...args);
		} as any;
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
		rebinded.children = fn as TFn;
		return rebinded as any;
	}

	/** Delays calling `fn` until `delay` ms have passed with no further calls — each call reschedules with the latest arguments. */
	static debounce<T extends TFn>(fn: T, delay: number = 50): TDebounceFn<T> {
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
		};
		return handler as any;
	}

	static leadingDebounce<T extends TFn>(fn: T, delay: number): T {
		let timeoutId: Timeout | undefined;
		return function (this: any, ...args: TParameters<T>) {
			const callNow = timeoutId === undefined;
			if (timeoutId !== undefined) clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				timeoutId = undefined;
			}, delay);
			if (callNow) fn.apply(this, args);
		} as any;
	}

	/** Calls `fn` immediately, then ignores further calls until `interval` ms have passed. */
	static throttle<T extends TFn>(fn: T, interval: number = 50): TThrottleFn<T> {
		let lastTime = 0;
		function handler(this: any, ...args: any[]) {
			const now = Date.now();
			if (now - lastTime >= interval) {
				fn.apply(this, args);
				lastTime = now;
			}
		}
		handler.clear = () => {
			lastTime = 0;
		};
		return handler as any;
	}

	/** Calls `fn` every `amount` calls (resetting the counter afterwards unless `autoClear` is `false`). */
	static step<T extends TFn>(fn: T, amount: number = 10, autoClear: boolean = true): TStepFn<T> {
		let counter = 0;
		function handler(this: any, ...args: any[]) {
			counter++;
			if (counter >= amount) {
				fn.apply(this, args);
				if (autoClear) counter = 0;
			}
		}
		handler.clear = () => {
			counter = 0;
		};
		return handler as any;
	}

	/** Calls `fn` at most once — every call after the first is a no-op until `clear()` resets it. */
	static once<T extends TFn>(fn: T): TOnceFn<T> {
		let runned = false;
		function handler(this: any, ...args: any[]) {
			if (runned) return;
			fn.apply(this, args);
			runned = true;
		}
		handler.clear = () => {
			runned = false;
		};
		return handler as any;
	}

	static memoize<T extends TFn>(
		fn: T,
		keyResolver?: (...args: TParameters<T>) => string
	): T & { cache: Map<string, any> } {
		const cache = new Map<string, any>();
		const memoized = function (this: any, ...args: TParameters<T>) {
			const key = keyResolver ? keyResolver(...args) : JSON.stringify(args);
			if (cache.has(key)) return cache.get(key);
			const result = fn.apply(this, args);
			cache.set(key, result);
			return result;
		};
		memoized.cache = cache;
		return memoized as any;
	}

	static curry(fn: TFn): TFn {
		return function curried(this: any, ...args: any[]) {
			if (args.length >= fn.length) {
				return fn.apply(this, args);
			}
			return (...nextArgs: any[]) => curried.apply(this, args.concat(nextArgs));
		};
	}
}

export { FunctionUtils };
