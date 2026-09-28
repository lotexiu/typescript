import { describe, it, expect } from 'vitest';
import { ValueHistory } from '@ts/value-history/model';

describe('ValueHistory.add / current', () => {
	it('starts with no current value', () => {
		const h = new ValueHistory<string>();
		expect(h.current()).toBeUndefined();
		expect(h.length()).toBe(0);
	});

	it('add() makes the new value current', () => {
		const h = new ValueHistory<string>();
		h.add('a');
		expect(h.current()).toEqual({ index: 0, value: 'a' });
	});

	it('successive add() calls advance the current index', () => {
		const h = new ValueHistory<string>();
		h.add('a');
		h.add('b');
		expect(h.current()).toEqual({ index: 1, value: 'b' });
		expect(h.length()).toBe(2);
	});
});

describe('ValueHistory.undo / redo', () => {
	it('undo() moves current back to the previous entry', () => {
		const h = new ValueHistory<string>();
		h.add('a');
		h.add('b');
		h.undo();
		expect(h.current()).toEqual({ index: 0, value: 'a' });
	});

	it('undo() past the first entry makes current undefined', () => {
		const h = new ValueHistory<string>();
		h.add('a');
		h.undo();
		expect(h.current()).toBeUndefined();
	});

	it('undo() is a no-op once already past the first entry', () => {
		const h = new ValueHistory<string>();
		h.add('a');
		h.undo();
		h.undo();
		expect(h.current()).toBeUndefined();
	});

	it('redo() moves current forward again after undo()', () => {
		const h = new ValueHistory<string>();
		h.add('a');
		h.add('b');
		h.undo();
		h.redo();
		expect(h.current()).toEqual({ index: 1, value: 'b' });
	});

	it('redo() is a no-op at the latest entry', () => {
		const h = new ValueHistory<string>();
		h.add('a');
		h.redo();
		expect(h.current()).toEqual({ index: 0, value: 'a' });
	});

	it('previous/next reflect the neighbors of the current entry', () => {
		const h = new ValueHistory<string>();
		h.add('a');
		h.add('b');
		h.add('c');
		h.undo();
		expect(h.previous()).toEqual({ index: 0, value: 'a' });
		expect(h.current()).toEqual({ index: 1, value: 'b' });
		expect(h.next()).toEqual({ index: 2, value: 'c' });
	});

	it('adding after an undo discards the redo-able future', () => {
		const h = new ValueHistory<string>();
		h.add('a');
		h.add('b');
		h.add('c');
		h.undo();
		h.undo();
		h.add('x');
		expect(h.history()).toEqual([
			{ index: 0, value: 'a' },
			{ index: 1, value: 'x' },
		]);
		expect(h.current()).toEqual({ index: 1, value: 'x' });
		expect(h.next()).toBeUndefined();
	});
});

describe('ValueHistory.history / length', () => {
	it('history lists every entry with its index', () => {
		const h = new ValueHistory<string>();
		h.add('a');
		h.add('b');
		expect(h.history()).toEqual([
			{ index: 0, value: 'a' },
			{ index: 1, value: 'b' },
		]);
	});
});

describe('ValueHistory cacheSize', () => {
	it('evicts the oldest entries once the cache size is exceeded', () => {
		const h = new ValueHistory<number>(3);
		h.add(1);
		h.add(2);
		h.add(3);
		h.add(4);
		expect(h.history().map((e) => e.value)).toEqual([2, 3, 4]);
		expect(h.length()).toBe(3);
	});

	it('re-indexes remaining entries from 0 after eviction', () => {
		const h = new ValueHistory<number>(2);
		h.add(1);
		h.add(2);
		h.add(3);
		expect(h.current()).toEqual({ index: 1, value: 3 });
	});

	it('does not evict when cacheSize is negative (unlimited, the default)', () => {
		const h = new ValueHistory<number>();
		for (let i = 0; i < 100; i++) h.add(i);
		expect(h.length()).toBe(100);
	});
});
