import { describe, it, expect } from 'vitest';
import { selection } from '@ts/composables/selection/model';

describe('selection size / isEmpty / set', () => {
	it('size and isEmpty follow the selection', () => {
		const selectionState = selection<string>();
		expect(selectionState.isEmpty()).toBe(true);
		selectionState.select('a', 'b');
		expect(selectionState.size()).toBe(2);
		expect(selectionState.isEmpty()).toBe(false);
		selectionState.clear();
		expect(selectionState.size()).toBe(0);
	});

	it('set replaces everything with a single notification', () => {
		const selectionState = selection(['a', 'b']);
		const seen: string[][] = [];
		selectionState.subscribe((selectedItems) => seen.push(selectedItems));
		selectionState.set(['c', 'd', 'e']);
		expect(selectionState()).toEqual(['c', 'd', 'e']);
		expect(seen).toHaveLength(1);
	});

	it('set accepts the current values without losing them', () => {
		const selectionState = selection(['a']);
		selectionState.set(selectionState());
		expect(selectionState()).toEqual(['a']);
	});
});
