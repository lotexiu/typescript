import { LocaleError } from '@ts/locale/error';
import { NUMBER_LOCALES } from './locale';

/** Helpers about the decimal part of numbers — e.g. to scale them to integers before exact arithmetic. */
class NumberUtils {
	static readonly #FRACTION_EXPONENT_REGEX = new RegExp('(?:\\.(\\d+))?(?:[eE]([+-]?\\d+))?$');

	/** Throws `LocaleError` (`finite`) for `NaN` and infinities. */
	static assertFinite(value: number): asserts value is number {
		if (!isFinite(value)) throw new LocaleError(NUMBER_LOCALES, 'finite');
	}

	/** Whether the number has a fractional part. */
	static hasDecimals(value: number): boolean {
		return NumberUtils.getDecimals(value) > 0;
	}

	/** The fractional part, always positive (`-1.25` → `0.25`). */
	static getDecimals(value: number): number {
		NumberUtils.assertFinite(value);
		return Math.abs(value % 1);
	}

	/** Power of ten that turns the number into an integer (`1.25` → `100`). */
	static getScaleToInt(value: number): number {
		return 10 ** NumberUtils.decimalsLength(value);
	}

	/** The number multiplied by `getScaleToInt`. */
	static scaleToInt(value: number): number {
		return value * NumberUtils.getScaleToInt(value);
	}

	/** How many decimal places the number has, exponent notation included (`1.5e-3` → 4). */
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
