import { TTimeConverted } from "./types";

/**
 * @internal
*/
class _Time {
	private static convertions = [
		['ns', 0.001, 1e6],
		['µs', 1, 1000],
		['ms', 1000, 1],
		['s', 60000, 1/1000],
		['min', 3600000, 1/60000],
		['hour', 86400000, 1/3600000],
		['days', 604800000, 1/86400000],
		['week', 18748800000, 1/604800000],
	] as const

	/** Converts a millisecond duration into the most readable unit (ns/µs/ms/s/min) with a formatted value. */
	static convert(ms: number): TTimeConverted {
		const formattedTime = {value: ms} as TTimeConverted
		for (const [unit, threshold, factor] of _Time.convertions) {
			if (ms < threshold) {
				formattedTime.unit = unit
				formattedTime.display = (ms / factor).toFixed(3);
			}
		}
		return formattedTime
	}
}

export {
	_Time,
}
