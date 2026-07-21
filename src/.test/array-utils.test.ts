import { describe, expect, it } from 'vitest';
import { ArrayUtils } from '@tsn-array/utils';

describe('ArrayUtils.includes', () => {
	it('narrows the type-guard true when the value is present', () => {
		const values = ['a', 'b', 'c'];
		const value: string = 'b';
		expect(ArrayUtils.includes(values, value)).toBe(true);
	});

	it('returns false when the value is absent', () => {
		expect(ArrayUtils.includes([1, 2, 3], 4)).toBe(false);
	});
});
