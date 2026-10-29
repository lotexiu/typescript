import { describe, it, expect } from 'vitest';
import { activeIndex } from '@ts/composables/active-index/model';
import { signal } from '@tsr-node/signal/model';

describe('activeIndex wrap option', () => {
	it('wraps by default', () => {
		const index = activeIndex(signal(3));
		index.set(2);
		index.next();
		expect(index()).toBe(0);
		index.prev();
		expect(index()).toBe(2);
	});

	it('wrap: false stops at the ends', () => {
		const index = activeIndex(signal(3), { wrap: false });
		index.set(2);
		index.next();
		expect(index()).toBe(2);
		index.set(0);
		index.prev();
		expect(index()).toBe(0);
		index.update((current) => current + 10);
		expect(index()).toBe(2);
	});

	it('wrap: false still starts from "none" and reaches the first item', () => {
		const index = activeIndex(signal(3), { wrap: false });
		expect(index()).toBe(-1);
		index.next();
		expect(index()).toBe(0);
	});
});

describe('activeIndex while the list is empty', () => {
	it('remembers a requested index and applies it once items exist', () => {
		const length = signal(0);
		const index = activeIndex(length, { wrap: false });
		index.set(0);
		expect(index()).toBe(-1);
		length.set(4);
		expect(index()).toBe(0);
	});

	it('a requested index larger than the list is clamped when it fills up', () => {
		const length = signal(0);
		const index = activeIndex(length, { wrap: false });
		index.set(7);
		length.set(3);
		expect(index()).toBe(2);
	});

	it('NONE stays NONE', () => {
		const length = signal(0);
		const index = activeIndex(length);
		index.reset();
		length.set(3);
		expect(index()).toBe(-1);
	});
});
