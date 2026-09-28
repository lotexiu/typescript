import { describe, it, expect } from 'vitest';
import { MathUtils } from '@tsn-math/utils';

describe('MathUtils.clamp', () => {
	it('clamps to the minimum', () => {
		expect(MathUtils.clamp(-5, 0, 10)).toBe(0);
	});

	it('clamps to the maximum', () => {
		expect(MathUtils.clamp(15, 0, 10)).toBe(10);
	});

	it('leaves the value untouched when within range', () => {
		expect(MathUtils.clamp(5, 0, 10)).toBe(5);
	});

	it('supports an open-ended min or max', () => {
		expect(MathUtils.clamp(-5, undefined, 10)).toBe(-5);
		expect(MathUtils.clamp(15, 0, undefined)).toBe(15);
	});
});

describe('MathUtils.inRange', () => {
	it('is inclusive by default', () => {
		expect(MathUtils.inRange(0, 0, 10)).toBe(true);
		expect(MathUtils.inRange(10, 0, 10)).toBe(true);
	});

	it('excludes the bounds when inclusive is false', () => {
		expect(MathUtils.inRange(0, 0, 10, false)).toBe(false);
		expect(MathUtils.inRange(5, 0, 10, false)).toBe(true);
	});
});

describe('MathUtils.round', () => {
	it('rounds to the given number of decimals', () => {
		expect(MathUtils.round(1.005, 2)).toBeCloseTo(1.01, 5);
		expect(MathUtils.round(1.2345, 2)).toBe(1.23);
	});

	it('rounds to an integer when decimals is 0', () => {
		expect(MathUtils.round(1.6, 0)).toBe(2);
	});

	it('throws for non-finite input', () => {
		expect(() => MathUtils.round(Infinity, 2)).toThrow();
	});
});

describe('MathUtils.sum', () => {
	it('adds decimal values exactly, avoiding float drift', () => {
		expect(0.1 + 0.2).not.toBe(0.3); // the float trap this helper exists to avoid
		expect(MathUtils.sum(0.1, 0.2)).toBe(0.3);
	});

	it('adds plain integers', () => {
		expect(MathUtils.sum(2, 4, 6)).toBe(12);
	});
});

describe('MathUtils.subtract', () => {
	it('subtracts decimal values exactly', () => {
		expect(MathUtils.subtract(0.3, 0.1)).toBeCloseTo(0.2, 10);
	});

	it('subtracts plain integers', () => {
		expect(MathUtils.subtract(10, 3, 2)).toBe(5);
	});
});

describe('MathUtils.multiply', () => {
	it('multiplies decimal values exactly', () => {
		expect(MathUtils.multiply(0.1, 0.2)).toBeCloseTo(0.02, 10);
	});

	it('multiplies plain integers', () => {
		expect(MathUtils.multiply(2, 3, 4)).toBe(24);
	});
});

describe('MathUtils.divide', () => {
	it('divides decimal values exactly', () => {
		expect(MathUtils.divide(0.4, 0.2)).toBeCloseTo(2, 10);
	});

	it('divides plain integers', () => {
		expect(MathUtils.divide(100, 5, 2)).toBe(10);
	});
});

describe('MathUtils.median', () => {
	it('returns the middle value for an odd count', () => {
		expect(MathUtils.median(3, 1, 2)).toBe(2);
	});

	it('averages the two middle values for an even count', () => {
		expect(MathUtils.median(1, 2, 3, 4)).toBe(2.5);
	});

	it('returns 0 for no values', () => {
		expect(MathUtils.median()).toBe(0);
	});

	it('does not require pre-sorted input', () => {
		expect(MathUtils.median(9, 1, 5, 3, 7)).toBe(5);
	});
});

describe('MathUtils.average', () => {
	it('averages plain integers', () => {
		expect(MathUtils.average(2, 4, 6)).toBe(4);
	});
});

describe('MathUtils.normalize', () => {
	it('maps values into a 0-1 range', () => {
		expect(MathUtils.normalize(0, 10, 0, 5, 10)).toEqual([0, 0.5, 1]);
	});
});

describe('MathUtils.map', () => {
	it('maps a value from one range to another', () => {
		expect(MathUtils.map(5, 0, 10, 0, 100)).toBe(50);
	});

	it('extrapolates outside the input range', () => {
		expect(MathUtils.map(15, 0, 10, 0, 100)).toBe(150);
	});
});

describe('MathUtils.lerp', () => {
	it('interpolates linearly between two values', () => {
		expect(MathUtils.lerp(0, 10, 0.5)).toBe(5);
		expect(MathUtils.lerp(0, 10, 0)).toBe(0);
		expect(MathUtils.lerp(0, 10, 1)).toBe(10);
	});

	it('extrapolates for amounts outside [0, 1]', () => {
		expect(MathUtils.lerp(0, 10, 1.5)).toBe(15);
	});
});

describe('MathUtils.random', () => {
	it('stays within the given range', () => {
		for (let i = 0; i < 50; i++) {
			const value = MathUtils.random(1, 5);
			expect(value).toBeGreaterThanOrEqual(1);
			expect(value).toBeLessThanOrEqual(5);
		}
	});

	it('returns an integer when requested', () => {
		for (let i = 0; i < 50; i++) {
			expect(Number.isInteger(MathUtils.random(0, 10, true))).toBe(true);
		}
	});
});
