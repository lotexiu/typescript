/**
 * @internal
*/
class _Time {
	/** Converts a millisecond duration into the most readable unit (ns/µs/ms/s/min) with a formatted value. */
	static convert(ms: number) {
		if (ms < 0.001) return {value: (ms * 1e6).toFixed(3), unit: 'ns'};
		if (ms < 1) return {value: (ms * 1e3).toFixed(3), unit: 'µs'};
		if (ms < 1000) return {value: ms.toFixed(3), unit: 'ms'};
		if (ms < 60000) return {value: (ms / 1000).toFixed(3), unit: 's'};
		return {value: (ms / 60000).toFixed(3), unit: 'min'};
	}
}

export {
	_Time,
}
