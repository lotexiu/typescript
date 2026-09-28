import { signal } from '@tsr-node/signal/model';
import { TSelection, TSelectionMode } from './types';

/**
 * Tracks selected keys, not items — selection survives a source list that
 * shrinks/changes (filter, pagination, async reload) because it never holds
 * onto the list itself, only the keys the caller chose.
 */
function selection<K>(mode: TSelectionMode = 'single'): TSelection<K> {
	const keys = signal(new Set<K>());

	function select(key: K): void {
		if (mode === 'single') keys().clear();
		keys().add(key);
		keys.notify();
	}

	function deselect(key: K): void {
		if (!keys().delete(key)) return;
		keys.notify();
	}

	function toggle(key: K): void {
		if (keys().has(key)) deselect(key);
		else select(key);
	}

	function clear(): void {
		if (keys().size === 0) return;
		keys().clear();
		keys.notify();
	}

	function selectAll(allKeys: Iterable<K>): void {
		keys().clear();
		for (const key of allKeys) keys().add(key);
		keys.notify();
	}

	function allSelected(universe: Iterable<K>): boolean {
		let any = false;
		for (const key of universe) {
			any = true;
			if (!keys().has(key)) return false;
		}
		return any;
	}

	function partiallySelected(universe: Iterable<K>): boolean {
		let selected = 0;
		let total = 0;
		for (const key of universe) {
			total++;
			if (keys().has(key)) selected++;
		}
		return selected > 0 && selected < total;
	}

	function toggleAll(universe: Iterable<K>): void {
		const selectAllOfIt = !allSelected(universe);
		for (const key of universe) {
			if (selectAllOfIt) keys().add(key);
			else keys().delete(key);
		}
		keys.notify();
	}

	return { keys, select, deselect, toggle, clear, selectAll, toggleAll, allSelected, partiallySelected };
}

export { selection };
