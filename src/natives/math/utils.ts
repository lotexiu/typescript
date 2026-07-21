import { isNullOrUndefined } from '@tsn-object/utils';
import { MATH_ERROR_LOCALE } from './locale';
import { LocaleUtils } from '@ts/locale/utils';
import { LocaleError } from '@ts/locale/error';

class MathUtils {
	static readonly #FRACTION_EXPONENT_REGEX = /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/;

	static assertFinite(value: number): asserts value is number {
		if (!isFinite(value)) throw new LocaleError(MATH_ERROR_LOCALE, 'infinity');
	}

	static clamp(value: number, min?: number, max?: number): number {
		let result = value;
		if (!isNullOrUndefined(min) && result < min) result = min;
		if (!isNullOrUndefined(max) && result > max) result = max;
		return result;
	}

	static hasDecimals(value: number): boolean {
		return MathUtils.getDecimals(value) > 0;
	}

	static getDecimals(value: number): number {
		MathUtils.assertFinite(value);
		return value % 1;
	}

	static inRange(value: number, min: number, max: number, inclusive = true): boolean {
		return inclusive ? value >= min && value <= max : value > min && value < max;
	}

	static decimalsLength(value: number): number {
		MathUtils.assertFinite(value);
		const match = value.toString().match(MathUtils.#FRACTION_EXPONENT_REGEX);
		if (!match) return 0;

		const fractionDigits = match[1] ? match[1].length : 0;
		const exponent = match[2] ? parseInt(match[2], 10) : 0;

		return Math.max(0, fractionDigits - exponent);
	}

	static round(value: number, decimals: number): number {
		MathUtils.assertFinite(value);
		const factor = 10 ** decimals;
		return Math.round((value + Number.EPSILON) * factor) / factor;
	}

	static scaleToInt(...values: number[]): number {
		return 10 ** Math.max(...values.map((v) => MathUtils.decimalsLength(v)));
	}

	static sum(...values: number[]): number {
		const scaleToInt = MathUtils.scaleToInt(...values);
		return values.reduce((acc, val) => acc + val * scaleToInt) / scaleToInt;
	}

	static subtract(...values: number[]): number {
		const scaleToInt = MathUtils.scaleToInt(...values);
		return values.reduce((acc, val) => acc - val * scaleToInt) / scaleToInt;
	}

	static multiply(...values: number[]): number {
		const scaleToInt = MathUtils.scaleToInt(...values);
		return values.reduce((acc, val) => acc * (val * scaleToInt)) / scaleToInt ** values.length;
	}

	static divide(...values: number[]): number {
		const scaleToInt = MathUtils.scaleToInt(...values);
		return (
			values.reduce((acc, val) => acc / (val * scaleToInt)) * scaleToInt ** (values.length - 1)
		);
	}

	static median(...values: number[]): number {
		if (values.length === 0) return 0;
		const sorted = [...values].sort((a, b) => a - b);
		const mid = Math.floor(sorted.length / 2);
		return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
	}

	static avarage(...values: number[]): number {
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
