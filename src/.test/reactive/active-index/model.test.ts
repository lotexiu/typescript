import { describe, it, expect } from 'vitest';
import { activeIndex, ActiveIndex } from '@tsr/active-index/model';
import { Computed } from '@tsr-node/computed/model';
import { signal } from '@tsr-node/signal/model';

describe('activeIndex', () => {
	it('starts with no active index (-1)', () => {
		const a = activeIndex(signal(4));
		expect(a()).toBe(-1);
	});

	it('is a Computed and an ActiveIndex', () => {
		const a = activeIndex(signal(4));
		expect(a instanceof Computed).toBe(true);
		expect(a instanceof ActiveIndex).toBe(true);
		expect(signal(0) instanceof ActiveIndex).toBe(false);
	});

	it('next() from none moves to the first item', () => {
		const a = activeIndex(signal(4));
		a.next();
		expect(a()).toBe(0);
	});

	it('prev() from none moves to the last item', () => {
		const a = activeIndex(signal(4));
		a.prev();
		expect(a()).toBe(3);
	});

	it('reset() goes back to none', () => {
		const a = activeIndex(signal(4));
		a.next();
		a.reset();
		expect(a()).toBe(-1);
	});

	it('set() jumps to an index, and set(-1) clears it', () => {
		const a = activeIndex(signal(4));
		a.set(2);
		expect(a()).toBe(2);
		a.set(-1);
		expect(a()).toBe(-1);
	});

	it('update() receives the current value', () => {
		const a = activeIndex(signal(10));
		a.set(2);
		a.update((value) => value + 3);
		expect(a()).toBe(5);
	});

	it('notifies subscribers when the index changes', () => {
		const a = activeIndex(signal(3));
		const seen: number[] = [];
		a.subscribe((value) => seen.push(value));
		a.next();
		a.next();
		expect(seen).toEqual([0, 1]);
	});
});

describe('activeIndex wraparound', () => {
	it('loops past the last item back to the first', () => {
		const a = activeIndex(signal(3));
		a.set(2);
		a.next();
		expect(a()).toBe(0);
	});

	it('loops past the first item back to the last', () => {
		const a = activeIndex(signal(3));
		a.set(0);
		a.prev();
		expect(a()).toBe(2);
	});

	it('wraps an out-of-range set() into the list', () => {
		const a = activeIndex(signal(3));
		a.set(7);
		expect(a()).toBe(1);
	});
});

describe('activeIndex with an empty list', () => {
	it('always resolves to none, without producing NaN', () => {
		const a = activeIndex(signal(0));
		a.next();
		expect(a()).toBe(-1);
		a.prev();
		expect(a()).toBe(-1);
		a.set(3);
		expect(a()).toBe(-1);
	});
});

describe('activeIndex with a changing length', () => {
	it('clamps the read value when the list shrinks below it', () => {
		const length = signal(5);
		const a = activeIndex(length);
		a.set(4);
		expect(a()).toBe(4);
		length.set(2);
		expect(a()).toBe(1);
	});

	it('reads none when the list shrinks to empty', () => {
		const length = signal(3);
		const a = activeIndex(length);
		a.set(0);
		length.set(0);
		expect(a()).toBe(-1);
	});

	it('leaves the index untouched while it is still within bounds', () => {
		const length = signal(5);
		const a = activeIndex(length);
		a.next();
		length.set(3);
		expect(a()).toBe(0);
	});

	it('moves from the clamped value, not the stale stored one', () => {
		const length = signal(5);
		const a = activeIndex(length);
		a.set(4);
		length.set(2); // reads 1
		a.next();
		expect(a()).toBe(0);
	});
});
