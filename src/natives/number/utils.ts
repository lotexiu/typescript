import { LocaleError } from '@ts/locale/error';
import { NUMBER_LOCALES } from './locale';

class NumberUtils {
	static readonly #FRACTION_EXPONENT_REGEX = /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/;

	static assertFinite(value: number): asserts value is number {
		if (!isFinite(value)) throw new LocaleError(NUMBER_LOCALES, 'finite');
	}

	static hasDecimals(value: number): boolean {
		return NumberUtils.getDecimals(value) > 0;
	}

	static getDecimals(value: number): number {
		NumberUtils.assertFinite(value);
		return value % 1;
	}

	static getScaleToInt(value: number): number {
		return 10 ** NumberUtils.decimalsLength(value);
	}

	static scaleToInt(value: number): number {
		return value * NumberUtils.getScaleToInt(value);
	}

	static decimalsLength(value: number): number {
		NumberUtils.assertFinite(value);
		const match = value.toString().match(NumberUtils.#FRACTION_EXPONENT_REGEX);
		if (!match) return 0;

		const fractionDigits = match[1] ? match[1].length : 0;
		const exponent = match[2] ? parseInt(match[2], 10) : 0;

		return Math.max(0, fractionDigits - exponent);
	}
}

export { NumberUtils };
