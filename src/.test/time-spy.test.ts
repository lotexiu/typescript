import { describe, expect, it } from 'vitest';
import { TimeUtils } from '@ts/time/utils';
import { SpyUtils } from '@ts/spy/utils';

describe('TimeUtils.convert', () => {
	it('picks the unit matching the magnitude', () => {
		expect(TimeUtils.convert(0.0001)).toEqual({ value: '100.000', unit: 'ns' });
		expect(TimeUtils.convert(0.5)).toEqual({ value: '500.000', unit: 'µs' });
		expect(TimeUtils.convert(42)).toEqual({ value: '42.000', unit: 'ms' });
		expect(TimeUtils.convert(2500)).toEqual({ value: '2.500', unit: 's' });
		expect(TimeUtils.convert(120000)).toEqual({ value: '2.000', unit: 'min' });
	});
});

describe('SpyUtils.timeExecution', () => {
	it('wraps a function and still returns its result unchanged', () => {
		const add = (a: number, b: number) => a + b;
		const wrapped = SpyUtils.timeExecution(add, 'add', 1000);

		expect(wrapped(2, 3)).toBe(5);
		expect(wrapped(10, -1)).toBe(9);
	});
});
