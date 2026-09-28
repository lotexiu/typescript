import { describe, it, expect } from 'vitest';
import { BitwiseUtils, bitEnum } from '@tsn/bitwise/utils';

describe('BitwiseUtils.enum', () => {
	it('assigns 0 to the none key and increasing powers of two to the rest', () => {
		const Flags = BitwiseUtils.enum('None', 'A', 'B', 'C');
		expect(Flags).toEqual({ None: 0, A: 1, B: 2, C: 4 });
	});

	it('is re-exported as the bare bitEnum function', () => {
		expect(bitEnum('None', 'X')).toEqual({ None: 0, X: 1 });
	});

	it('handles no flag keys beyond the none key', () => {
		expect(BitwiseUtils.enum('None')).toEqual({ None: 0 });
	});
});

describe('BitwiseUtils.enabledKeys / disabledKeys', () => {
	const Flags = BitwiseUtils.enum('None', 'A', 'B', 'C');

	it('lists only the keys whose bit is set', () => {
		expect(BitwiseUtils.enabledKeys(Flags.A | Flags.C, Flags)).toEqual(['A', 'C']);
	});

	it('lists only the keys whose bit is unset', () => {
		expect(BitwiseUtils.disabledKeys(Flags.A | Flags.C, Flags)).toEqual(['None', 'B']);
	});

	it('returns an empty list when no flags match', () => {
		expect(BitwiseUtils.enabledKeys(0, Flags)).toEqual([]);
	});
});

describe('BitwiseUtils.isEnabled / isDisabled', () => {
	const Flags = BitwiseUtils.enum('None', 'A', 'B', 'C');
	const value = Flags.A | Flags.C;

	it('isEnabled is true only when every given flag is set', () => {
		expect(BitwiseUtils.isEnabled(value, Flags.A)).toBe(true);
		expect(BitwiseUtils.isEnabled(value, Flags.A, Flags.C)).toBe(true);
		expect(BitwiseUtils.isEnabled(value, Flags.A, Flags.B)).toBe(false);
	});

	it('isDisabled is true only when every given flag is unset', () => {
		expect(BitwiseUtils.isDisabled(value, Flags.B)).toBe(true);
		expect(BitwiseUtils.isDisabled(value, Flags.A)).toBe(false);
	});
});

describe('BitwiseUtils.toggle / enable / disable', () => {
	const Flags = BitwiseUtils.enum('None', 'A', 'B', 'C');

	it('toggle flips the given bits', () => {
		expect(BitwiseUtils.toggle(Flags.A, Flags.A)).toBe(0);
		expect(BitwiseUtils.toggle(0, Flags.A, Flags.B)).toBe(Flags.A | Flags.B);
	});

	it('enable sets the given bits without touching others', () => {
		expect(BitwiseUtils.enable(Flags.A, Flags.B)).toBe(Flags.A | Flags.B);
		expect(BitwiseUtils.enable(Flags.A, Flags.A)).toBe(Flags.A);
	});

	it('disable clears the given bits without touching others', () => {
		expect(BitwiseUtils.disable(Flags.A | Flags.B, Flags.A)).toBe(Flags.B);
		expect(BitwiseUtils.disable(Flags.A, Flags.B)).toBe(Flags.A);
	});
});
