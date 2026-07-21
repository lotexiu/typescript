import { TimeUtils } from "@ts/time/utils";
import { TFn, TReturnType } from "@tsn-function/types";

/**
 * @internal
*/
class _Spy {
	/** Wraps `fn`, logging its average execution time to the console every `averageAmount` calls. */
	static timeExecution<T extends TFn>(fn: T, name: string, averageAmount = 1000): T {
		let
			totalTime = 0,
			count = 0;

		return function (this: any, ...args: Parameters<T>): TReturnType<T> {
			if (count < averageAmount) {
				const start = performance.now();
				const result = fn.apply(this, args);
				totalTime += performance.now() - start;
				count++;
				return result;
			} else {
				const averageTime = TimeUtils.convert(totalTime / count);
				console.log(`Average of (${averageAmount}) for ${name}: ${averageTime.value} ${averageTime.unit}`);
				totalTime = 0; count = 0;
			}
			return fn.apply(this, args);
		} as T;
	}
}

export {
	_Spy,
}
