import { _Time } from "@ts/time/implementations";
import { TFn, TReturnType } from "@tsn-function/types";

function benchmarkResult(value: number) {
	const result = _Time.convert(value)
	console.log(`Finished in ${result.display}${result.unit}`)
}

/**
 * @internal
*/
class _Spy {
	static timeExecution<T extends TFn>(
		fn: T,
		iterations = 10000,
		callback: (value: number) => void = benchmarkResult,
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
		iterations = 10000,
		callback: (value: number) => void = benchmarkResult,
	) {
		const execFn = this.timeExecution(fn, iterations, (msValue) => { callback(msValue) })
		for (let i = 1; i <= iterations; i++) execFn()
	}
}

let marginError = 0;
const precision = 100000
_Spy.benchmark(() => { }, precision, (value) => { marginError = value })

export {
	_Spy,
}
