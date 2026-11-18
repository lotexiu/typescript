import { isNullOrUndefined } from '@tsn-object/utils';
import { NumberUtils } from '@tsn-number/utils';

/** Number helpers: clamping, ranges, rounding, aggregates and interpolation. */
class MathUtils {

	/** Keeps `value` between `min` and `max`; a missing bound is not applied. */
	static clamp(value: number, min?: number, max?: number): number {
		let result = value;
		if (!isNullOrUndefined(min) && result < min) result = min;
		if (!isNullOrUndefined(max) && result > max) result = max;
		return result;
	}

	/** Whether `value` is between `min` and `max` (bounds included unless `inclusive` is false). */
	static inRange(value: number, min: number, max: number, inclusive = true): boolean {
		return inclusive ? value >= min && value <= max : value > min && value < max;
	}

	/** Rounds to `decimals` decimal places. */
	static round(value: number, decimals: number): number {
		NumberUtils.assertFinite(value);
		const factor = 10 ** decimals;
		return Math.round((value + Number.EPSILON) * factor) / factor;
	}

	/** Sum of the values. */
	static sum(...values: number[]): number {
		const scale = Math.max(...values.map(NumberUtils.getScaleToInt));
		return values.map((val) => val * scale).reduce((acc, val) => acc + val) / scale;
	}

	/** First value minus the others. */
	static subtract(...values: number[]): number {
		const scale = Math.max(...values.map(NumberUtils.getScaleToInt));
		return values.map((val) => val * scale).reduce((acc, val) => acc - val) / scale;
	}

	/** Product of the values. */
	static multiply(...values: number[]): number {
		const scale = Math.max(...values.map(NumberUtils.getScaleToInt));
		return values.map((val) => val * scale).reduce((acc, val) => acc * val) / scale ** values.length;
	}

	/** First value divided by the others, in order. */
	static divide(...values: number[]): number {
		const scale = Math.max(...values.map(NumberUtils.getScaleToInt));
		return values.reduce((acc, val) => acc / (val * scale)) * scale ** (values.length - 1);
	}

	/** Middle value (average of the two middle ones for an even count). */
	static median(...values: number[]): number {
		if (values.length === 0) return 0;
		const sorted = [...values].sort((left, right) => left - right);
		const mid = Math.floor(sorted.length / 2);
		return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
	}

	/** Arithmetic mean. */
	static average(...values: number[]): number {
		return MathUtils.divide(MathUtils.sum(...values), values.length);
	}

	/** Maps each value from `[min, max]` to `[0, 1]`. */
	static normalize(min: number, max: number, ...values: number[]) {
		const range = max - min;
		return values.map((value) => (value - min) / range);
	}

	/** Maps `value` from one range to another, linearly (not clamped). */
	static map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
		return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
	}

	/** Value between `start` and `stop` at `amount` (0 → start, 1 → stop). */
	static lerp(start: number, stop: number, amount: number): number {
		return start + (stop - start) * amount;
	}

	/** Random in `[min, max)` — `max` is exclusive, also with `integer = true` (`random(0, 3, true)` yields 0, 1 or 2). */
	static random(min: number, max: number, integer = false): number {
		const res = Math.random() * (max - min) + min;
		return integer ? Math.floor(res) : res;
	}
}

export { MathUtils };
