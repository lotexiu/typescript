import { describe, it, expect } from 'vitest';
import { activeIndex } from '@ts/composables/active-index/model';
import { signal } from '@tsr-node/signal/model';

describe('activeIndex', () => {
	it('starts with no active index (-1)', () => {
		const a = activeIndex(4);
		expect(a.index()).toBe(-1);
	});

	it('next() from none moves to the first item', () => {
		const a = activeIndex(4);
		a.next();
		expect(a.index()).toBe(0);
	});

	it('prev() from none moves to the last item', () => {
		const a = activeIndex(4);
		a.prev();
		expect(a.index()).toBe(3);
	});

	it('first() / last() jump directly to the edges', () => {
		const a = activeIndex(4);
		a.last();
		expect(a.index()).toBe(3);
		a.first();
		expect(a.index()).toBe(0);
	});

	it('clear() resets to none', () => {
		const a = activeIndex(4);
		a.next();
		a.clear();
		expect(a.index()).toBe(-1);
	});

	it('an empty list (length 0) always resolves to none', () => {
		const a = activeIndex(0);
		a.next();
		expect(a.index()).toBe(-1);
		a.last();
		expect(a.index()).toBe(-1);
	});
});

describe('activeIndex wraparound', () => {
	it('loops past the last item back to the first by default', () => {
		const a = activeIndex(3);
		a.last();
		a.next();
		expect(a.index()).toBe(0);
	});

	it('loops past the first item back to the last by default', () => {
		const a = activeIndex(3);
		a.first();
		a.prev();
		expect(a.index()).toBe(2);
	});

	it('stops at the last item instead of wrapping when loop is false', () => {
		const a = activeIndex(3, { loop: false });
		a.last();
		a.next();
		expect(a.index()).toBe(2);
	});

	it('stops at the first item instead of wrapping when loop is false', () => {
		const a = activeIndex(3, { loop: false });
		a.first();
		a.prev();
		expect(a.index()).toBe(0);
	});
});

describe('activeIndex with a reactive length', () => {
	it('re-clamps the active index when the list shrinks below it', () => {
		const length = signal(5);
		const a = activeIndex(length);
		a.last();
		expect(a.index()).toBe(4);
		length.set(2);
		expect(a.index()).toBe(1);
	});

	it('resets to none when the list shrinks to empty', () => {
		const length = signal(3);
		const a = activeIndex(length);
		a.first();
		length.set(0);
		expect(a.index()).toBe(-1);
	});

	it('leaves the active index untouched when it is still within bounds', () => {
		const length = signal(5);
		const a = activeIndex(length);
		a.next(); // index 0
		length.set(3);
		expect(a.index()).toBe(0);
	});
});
