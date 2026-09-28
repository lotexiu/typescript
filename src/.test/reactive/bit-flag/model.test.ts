import { describe, it, expect } from 'vitest';
import { bitFlag, BitFlag } from '@tsr/bit-flag/model';
import { Signal } from '@tsr-node/signal/model';

describe('bitFlag', () => {
	it('starts at the none value (0)', () => {
		const flag = bitFlag('A', 'B');
		expect(flag()).toBe(0);
	});

	it('assigns increasing bit values to each key', () => {
		const flag = bitFlag('A', 'B', 'C');
		expect(flag.flags).toEqual({ none: 0, A: 1, B: 2, C: 4 });
	});

	it('is a real Signal (reads/writes through the underlying node)', () => {
		const flag = bitFlag('A');
		expect(flag instanceof Signal).toBe(true);
		flag.set(flag.flags.A);
		expect(flag()).toBe(flag.flags.A);
	});

	it('is recognized by `instanceof BitFlag`', () => {
		const flag = bitFlag('A');
		expect(flag instanceof BitFlag).toBe(true);
		expect(signalLike() instanceof BitFlag).toBe(false);
		function signalLike() {
			// a plain Signal, not a BitFlag
			return Object.assign(() => 0, { set: () => true });
		}
	});
});

describe('bitFlag.enable', () => {
	it('sets the given bit on the flag state', () => {
		const flag = bitFlag('A', 'B');
		flag.enable(flag.flags.A);
		expect(flag() & flag.flags.A).toBe(flag.flags.A);
	});

	it('does not clear other already-enabled bits', () => {
		const flag = bitFlag('A', 'B');
		flag.enable(flag.flags.A);
		flag.enable(flag.flags.B);
		expect(flag()).toBe(flag.flags.A | flag.flags.B);
	});
});

describe('bitFlag.disable', () => {
	it('clears the given bit on the flag state', () => {
		const flag = bitFlag('A', 'B');
		flag.enable(flag.flags.A, flag.flags.B);
		flag.disable(flag.flags.A);
		expect(flag()).toBe(flag.flags.B);
	});
});

describe('bitFlag.toggle', () => {
	it('flips the given bits on the flag state', () => {
		const flag = bitFlag('A');
		flag.toggle(flag.flags.A);
		expect(flag()).toBe(flag.flags.A);
		flag.toggle(flag.flags.A);
		expect(flag()).toBe(0);
	});
});

describe('bitFlag.enabled / disabled', () => {
	it('enabled() reflects the current flag state after enable()', () => {
		const flag = bitFlag('A', 'B');
		flag.enable(flag.flags.A);
		expect(flag.enabled(flag.flags.A)).toBe(true);
		expect(flag.enabled(flag.flags.B)).toBe(false);
	});

	it('disabled() reflects the current flag state after disable()', () => {
		const flag = bitFlag('A', 'B');
		flag.enable(flag.flags.A, flag.flags.B);
		flag.disable(flag.flags.B);
		expect(flag.disabled(flag.flags.B)).toBe(true);
		expect(flag.disabled(flag.flags.A)).toBe(false);
	});
});

describe('bitFlag.reset', () => {
	it('resets the flag state back to 0', () => {
		const flag = bitFlag('A', 'B');
		flag.enable(flag.flags.A, flag.flags.B);
		flag.reset();
		expect(flag()).toBe(0);
	});
});

describe('bitFlag reactivity', () => {
	it('notifies subscribers when enable()/disable()/toggle() change the state', () => {
		const flag = bitFlag('A');
		const seen: number[] = [];
		flag.subscribe((v) => seen.push(v));
		flag.enable(flag.flags.A);
		flag.disable(flag.flags.A);
		flag.toggle(flag.flags.A);
		expect(seen).toEqual([flag.flags.A, 0, flag.flags.A]);
	});
});
