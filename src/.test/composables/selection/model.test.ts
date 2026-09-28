import { describe, it, expect, vi } from 'vitest';
import { selection } from '@ts/composables/selection/model';

describe('selection (single mode)', () => {
	it('starts with no selected keys', () => {
		const s = selection<number>();
		expect(s.keys()).toEqual(new Set());
	});

	it('select() replaces any previously selected key', () => {
		const s = selection<number>('single');
		s.select(1);
		s.select(2);
		expect(s.keys()).toEqual(new Set([2]));
	});

	it('toggle() selects an unselected key and deselects an already-selected one', () => {
		const s = selection<number>('single');
		s.toggle(1);
		expect(s.keys()).toEqual(new Set([1]));
		s.toggle(1);
		expect(s.keys()).toEqual(new Set());
	});
});

describe('selection (multi mode)', () => {
	it('select() accumulates keys instead of replacing', () => {
		const s = selection<number>('multi');
		s.select(1);
		s.select(2);
		expect(s.keys()).toEqual(new Set([1, 2]));
	});

	it('deselect() removes only the given key', () => {
		const s = selection<number>('multi');
		s.select(1);
		s.select(2);
		s.deselect(1);
		expect(s.keys()).toEqual(new Set([2]));
	});

	it('selectAll() replaces the whole set with the given keys', () => {
		const s = selection<number>('multi');
		s.select(9);
		s.selectAll([1, 2, 3]);
		expect(s.keys()).toEqual(new Set([1, 2, 3]));
	});

	it('clear() empties the set', () => {
		const s = selection<number>('multi');
		s.selectAll([1, 2, 3]);
		s.clear();
		expect(s.keys()).toEqual(new Set());
	});
});

describe('selection "select all" helpers (multi mode)', () => {
	it('allSelected() is true only when every key of the universe is selected', () => {
		const s = selection<number>('multi');
		s.select(1);
		expect(s.allSelected([1, 2, 3])).toBe(false);
		s.selectAll([1, 2, 3]);
		expect(s.allSelected([1, 2, 3])).toBe(true);
	});

	it('allSelected() is false for an empty universe', () => {
		const s = selection<number>('multi');
		expect(s.allSelected([])).toBe(false);
	});

	it('partiallySelected() is true only when some but not all of the universe is selected', () => {
		const s = selection<number>('multi');
		expect(s.partiallySelected([1, 2, 3])).toBe(false);
		s.select(1);
		expect(s.partiallySelected([1, 2, 3])).toBe(true);
		s.selectAll([1, 2, 3]);
		expect(s.partiallySelected([1, 2, 3])).toBe(false);
	});

	it('toggleAll() selects every key of the universe when not all are selected', () => {
		const s = selection<number>('multi');
		s.select(1);
		s.toggleAll([1, 2, 3]);
		expect(s.keys()).toEqual(new Set([1, 2, 3]));
	});

	it('toggleAll() deselects the universe when all of it is already selected', () => {
		const s = selection<number>('multi');
		s.selectAll([1, 2, 3]);
		s.toggleAll([1, 2, 3]);
		expect(s.keys()).toEqual(new Set());
	});

	it('toggleAll() leaves keys outside the universe untouched', () => {
		const s = selection<number>('multi');
		s.select(99);
		s.toggleAll([1, 2, 3]);
		expect(s.keys()).toEqual(new Set([99, 1, 2, 3]));
		s.toggleAll([1, 2, 3]);
		expect(s.keys()).toEqual(new Set([99]));
	});
});

describe('selection notifications', () => {
	it('notifies subscribers on a real change', () => {
		const s = selection<number>('multi');
		const listener = vi.fn();
		s.keys.subscribe(listener);
		s.select(1);
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it('does not notify when deselect() targets a key that was not selected', () => {
		const s = selection<number>('multi');
		const listener = vi.fn();
		s.keys.subscribe(listener);
		s.deselect(999);
		expect(listener).not.toHaveBeenCalled();
	});

	it('does not notify when clear() runs on an already-empty selection', () => {
		const s = selection<number>('multi');
		const listener = vi.fn();
		s.keys.subscribe(listener);
		s.clear();
		expect(listener).not.toHaveBeenCalled();
	});
});
