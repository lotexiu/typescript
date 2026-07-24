function convert(ms: number) {
	if (ms < 0.001) return { value: (ms * 1e6).toFixed(3), unit: 'ns' };
	if (ms < 1) return { value: (ms * 1e3).toFixed(3), unit: 'µs' };
	if (ms < 1000) return { value: ms.toFixed(3), unit: 'ms' };
	if (ms < 60000) return { value: (ms / 1000).toFixed(3), unit: 's' };
	return { value: (ms / 60000).toFixed(3), unit: 'min' };
}

function timeExecution<T extends (...args: any[]) => any>(
	fn: T,
	callback: (value: number) => void,
	averageAmount = 1000
): T {
	let
		totalTime = 0,
		count = 0;

	return function (this: any, ...args: Parameters<T>): ReturnType<T> {
		const start = performance.now();
		const result = fn.apply(this, args);
		totalTime += (performance.now() - start) - marginError;
		count++;
		if (count == averageAmount) {
			callback(totalTime / count);
			totalTime = 0; count = 0;
		}
		return result;
	} as T;
}

function benchmark<T extends (...args: any[]) => any>(
	fn: T,
	callback: (value: number, iterations: number) => void,
	iterations = 10000
) {
	const execFn = timeExecution(fn, (msValue) => { callback(msValue, iterations) }, iterations)
	for (let i = 1; i <= iterations; i++) execFn()
}

function benchmarkResult(name: string, iterations: number, msValue: number) {
	const { unit: avgUnit, value: avgValue } = convert(msValue)
	const { unit: totalUnit, value: total } = convert(msValue * iterations)
	console.log(`[${name}]\n- of: ${iterations}\n- avg: ${avgValue} ${avgUnit}\n- total: ${total} ${totalUnit}`)
}

let marginError = 0;
const precision = 100000
benchmark(() => { }, (value) => { marginError = value }, precision)


export {
	timeExecution,
	convert,
	benchmark,
	benchmarkResult,
	marginError,
}