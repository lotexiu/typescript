import { describe, it, expect } from 'vitest';
import { ValueHistory } from '@ts/value-history/model';

describe('ValueHistory.add / current', () => {
	it('starts with no current value', () => {
		const history = new ValueHistory<string>();
		expect(history.current()).toBeUndefined();
		expect(history.length()).toBe(0);
	});

	it('add() makes the new value current', () => {
		const history = new ValueHistory<string>();
		history.add('a');
		expect(history.current()).toEqual({ index: 0, value: 'a' });
	});

	it('successive add() calls advance the current index', () => {
		const history = new ValueHistory<string>();
		history.add('a');
		history.add('b');
		expect(history.current()).toEqual({ index: 1, value: 'b' });
		expect(history.length()).toBe(2);
	});
});

describe('ValueHistory.undo / redo', () => {
	it('undo() moves current back to the previous entry', () => {
		const history = new ValueHistory<string>();
		history.add('a');
		history.add('b');
		history.undo();
		expect(history.current()).toEqual({ index: 0, value: 'a' });
	});

	it('undo() past the first entry makes current undefined', () => {
		const history = new ValueHistory<string>();
		history.add('a');
		history.undo();
		expect(history.current()).toBeUndefined();
	});

	it('undo() is a no-op once already past the first entry', () => {
		const history = new ValueHistory<string>();
		history.add('a');
		history.undo();
		history.undo();
		expect(history.current()).toBeUndefined();
	});

	it('redo() moves current forward again after undo()', () => {
		const history = new ValueHistory<string>();
		history.add('a');
		history.add('b');
		history.undo();
		history.redo();
		expect(history.current()).toEqual({ index: 1, value: 'b' });
	});

	it('redo() is a no-op at the latest entry', () => {
		const history = new ValueHistory<string>();
		history.add('a');
		history.redo();
		expect(history.current()).toEqual({ index: 0, value: 'a' });
	});

	it('previous/next reflect the neighbors of the current entry', () => {
		const history = new ValueHistory<string>();
		history.add('a');
		history.add('b');
		history.add('c');
		history.undo();
		expect(history.previous()).toEqual({ index: 0, value: 'a' });
		expect(history.current()).toEqual({ index: 1, value: 'b' });
		expect(history.next()).toEqual({ index: 2, value: 'c' });
	});

	it('adding after an undo discards the redo-able future', () => {
		const history = new ValueHistory<string>();
		history.add('a');
		history.add('b');
		history.add('c');
		history.undo();
		history.undo();
		history.add('x');
		expect(history.history()).toEqual([
			{ index: 0, value: 'a' },
			{ index: 1, value: 'x' },
		]);
		expect(history.current()).toEqual({ index: 1, value: 'x' });
		expect(history.next()).toBeUndefined();
	});
});

describe('ValueHistory.history / length', () => {
	it('history lists every entry with its index', () => {
		const history = new ValueHistory<string>();
		history.add('a');
		history.add('b');
		expect(history.history()).toEqual([
			{ index: 0, value: 'a' },
			{ index: 1, value: 'b' },
		]);
	});
});

describe('ValueHistory cacheSize', () => {
	it('evicts the oldest entries once the cache size is exceeded', () => {
		const history = new ValueHistory<number>(3);
		history.add(1);
		history.add(2);
		history.add(3);
		history.add(4);
		expect(history.history().map((entry) => entry.value)).toEqual([2, 3, 4]);
		expect(history.length()).toBe(3);
	});

	it('re-indexes remaining entries from 0 after eviction', () => {
		const history = new ValueHistory<number>(2);
		history.add(1);
		history.add(2);
		history.add(3);
		expect(history.current()).toEqual({ index: 1, value: 3 });
	});

	it('does not evict when cacheSize is negative (unlimited, the default)', () => {
		const history = new ValueHistory<number>();
		for (let i = 0; i < 100; i++) history.add(i);
		expect(history.length()).toBe(100);
	});
});

describe('ValueHistory canUndo / canRedo', () => {
	it('follow the position in the stack', () => {
		const history = new ValueHistory<string>();
		expect(history.canUndo()).toBe(false);
		expect(history.canRedo()).toBe(false);
		history.add('a');
		history.add('b');
		expect(history.canUndo()).toBe(true);
		expect(history.canRedo()).toBe(false);
		history.undo();
		expect(history.canRedo()).toBe(true);
		history.undo(); // -1: before the first entry
		expect(history.canUndo()).toBe(false);
	});
});
