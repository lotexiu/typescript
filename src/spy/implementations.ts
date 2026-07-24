import { _Time } from "@ts/time/implementations";
import { TFn, TReturnType } from "@tsn-function/types";

/**
 * @internal
*/
class _Spy {
	static timeExecution<T extends TFn>(
		fn: T,
		callback: (value: number) => void,
		iterations = 10000
	): T {
		let
			totalTime = 0,
			count = 0;

		return function (this: any, ...args: Parameters<T>): TReturnType<T> {
			const start = performance.now();
			const result = fn.apply(this, args);
			totalTime += (performance.now() - start) - marginError;
			count++;
			if (count == iterations) {
				callback(totalTime / count);
				totalTime = 0; count = 0;
			}
			return result;
		} as T;
	}

	static benchmark<T extends TFn>(
		fn: T,
		callback: (value: number) => void,
		iterations = 10000
	) {
		const execFn = this.timeExecution(fn, (msValue) => { callback(msValue) }, iterations)
		for (let i = 1; i <= iterations; i++) execFn()
	}
}

let marginError = 0;
const precision = 100000
_Spy.benchmark(() => { }, (value) => { marginError = value }, precision)

export {
	_Spy,
}
