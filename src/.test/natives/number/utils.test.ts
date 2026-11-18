import { describe, it, expect } from 'vitest';
import { NumberUtils } from '@tsn-number/utils';
import { LocaleError } from '@ts/locale/error';

describe('NumberUtils.assertFinite', () => {
	it('does not throw for finite numbers', () => {
		expect(() => NumberUtils.assertFinite(42)).not.toThrow();
		expect(() => NumberUtils.assertFinite(0)).not.toThrow();
		expect(() => NumberUtils.assertFinite(-3.5)).not.toThrow();
	});

	it('throws a LocaleError for Infinity', () => {
		expect(() => NumberUtils.assertFinite(Infinity)).toThrow(LocaleError);
	});

	it('throws a LocaleError for NaN', () => {
		expect(() => NumberUtils.assertFinite(NaN)).toThrow(LocaleError);
	});
});

describe('NumberUtils.decimalsLength', () => {
	it('is 0 for integers', () => {
		expect(NumberUtils.decimalsLength(42)).toBe(0);
		expect(NumberUtils.decimalsLength(0)).toBe(0);
	});

	it('counts fractional digits', () => {
		expect(NumberUtils.decimalsLength(1.5)).toBe(1);
		expect(NumberUtils.decimalsLength(1.234)).toBe(3);
	});

	it('accounts for negative exponents in scientific notation', () => {
		expect(NumberUtils.decimalsLength(1e-7)).toBe(7);
	});

	it('is unaffected by a positive exponent (never goes below 0)', () => {
		expect(NumberUtils.decimalsLength(1e21)).toBe(0);
	});

	it('throws for non-finite input', () => {
		expect(() => NumberUtils.decimalsLength(NaN)).toThrow(LocaleError);
	});
});

describe('NumberUtils.getScaleToInt / scaleToInt', () => {
	it('returns 1 for integers', () => {
		expect(NumberUtils.getScaleToInt(42)).toBe(1);
	});

	it('returns a power of ten matching the decimal length', () => {
		expect(NumberUtils.getScaleToInt(1.5)).toBe(10);
		expect(NumberUtils.getScaleToInt(1.25)).toBe(100);
	});

	it('scaleToInt produces an integer-valued result', () => {
		expect(NumberUtils.scaleToInt(1.25)).toBe(125);
		expect(NumberUtils.scaleToInt(42)).toBe(42);
	});
});

describe('NumberUtils.getDecimals / hasDecimals', () => {
	it('getDecimals returns the fractional remainder for positive numbers', () => {
		expect(NumberUtils.getDecimals(1.5)).toBeCloseTo(0.5);
		expect(NumberUtils.getDecimals(2)).toBe(0);
	});

	it('hasDecimals is true when there is a fractional part', () => {
		expect(NumberUtils.hasDecimals(1.5)).toBe(true);
	});

	it('hasDecimals is false for whole numbers', () => {
		expect(NumberUtils.hasDecimals(2)).toBe(false);
		expect(NumberUtils.hasDecimals(0)).toBe(false);
	});

	it('hasDecimals is true for a negative number with a fractional part', () => {
		// `value % 1` is negative for negative fractional values in JS (-1.5 % 1 === -0.5),
		// so a naive `getDecimals(value) > 0` check misses this case.
		expect(NumberUtils.hasDecimals(-1.5)).toBe(true);
	});
});
