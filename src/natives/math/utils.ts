import { isNullOrUndefined } from '@tsn-object/utils';
import { NumberUtils } from '@tsn-number/utils';

class MathUtils {

	static clamp(value: number, min?: number, max?: number): number {
		let result = value;
		if (!isNullOrUndefined(min) && result < min) result = min;
		if (!isNullOrUndefined(max) && result > max) result = max;
		return result;
	}

	static inRange(value: number, min: number, max: number, inclusive = true): boolean {
		return inclusive ? value >= min && value <= max : value > min && value < max;
	}

	static round(value: number, decimals: number): number {
		NumberUtils.assertFinite(value);
		const factor = 10 ** decimals;
		return Math.round((value + Number.EPSILON) * factor) / factor;
	}

	static sum(...values: number[]): number {
		const scale = Math.max(...values.map(NumberUtils.getScaleToInt));
		return values.reduce((acc, val) => acc + val * scale) / scale;
	}

	static subtract(...values: number[]): number {
		const scale = Math.max(...values.map(NumberUtils.getScaleToInt));
		return values.reduce((acc, val) => acc - val * scale) / scale;
	}

	static multiply(...values: number[]): number {
		const scale = Math.max(...values.map(NumberUtils.getScaleToInt));
		return values.reduce((acc, val) => acc * (val * scale)) / scale ** values.length;
	}

	static divide(...values: number[]): number {
		const scale = Math.max(...values.map(NumberUtils.getScaleToInt));
		return values.reduce((acc, val) => acc / (val * scale)) * scale ** (values.length - 1);
	}

	static median(...values: number[]): number {
		if (values.length === 0) return 0;
		const sorted = [...values].sort((a, b) => a - b);
		const mid = Math.floor(sorted.length / 2);
		return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
	}

	static average(...values: number[]): number {
		return MathUtils.divide(MathUtils.sum(...values), values.length);
	}

	static normalize(min: number, max: number, ...values: number[]) {
		const range = max - min;
		return values.map((v) => (v - min) / range);
	}

	static map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
		return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
	}

	static lerp(start: number, stop: number, amount: number): number {
		return start + (stop - start) * amount;
	}

	static random(min: number, max: number, integer = false): number {
		const res = Math.random() * (max - min) + min;
		return integer ? Math.floor(res) : res;
	}
}

export { MathUtils };
