import { Signal, signal } from '@tsr-node/signal/model';
import { INTERNAL } from '@tsn-object/declarations';
import { TSelection, TSelectionMode } from './types';

/**
 * Tracks selected keys, not items — selection survives a source list that
 * shrinks/changes (filter, pagination, async reload) because it never holds
 * onto the list itself, only the keys the caller chose.
 *
 * The keys live in a `Set` mutated in place + `notify()` (see "mutar in-place" in CLAUDE.md).
 */
type Selection<K> = Signal<Set<K>> & {
	select(key: K): void;
	deselect(key: K): void;
	toggle(key: K): void;
	clear(): void;
	/** Replaces the whole selection with exactly these keys. */
	selectAll(keys: Iterable<K>): void;
	/** Selects every key of `universe` if any is unselected, otherwise deselects all of them — keys outside `universe` are untouched. */
	toggleAll(universe: Iterable<K>): void;
	/** True if `universe` is non-empty and every one of its keys is selected. */
	allSelected(universe: Iterable<K>): boolean;
	/** True if some but not all of `universe` is selected — the "master checkbox" indeterminate case. */
	partiallySelected(universe: Iterable<K>): boolean;
};
const Selection = {
	[Symbol.hasInstance](instance: any): instance is Selection<any> {
		return typeof instance === 'function' && instance.toggle === Selection.toggle && instance instanceof Signal;
	},

	select<K>(this: TSelection<K>, key: K): void {
		const keys = this();
		if (this[INTERNAL].mode === 'single') keys.clear();
		keys.add(key);
		this.notify();
	},

	deselect<K>(this: TSelection<K>, key: K): void {
		if (!this().delete(key)) return;
		this.notify();
	},

	toggle<K>(this: TSelection<K>, key: K): void {
		if (this().has(key)) Selection.deselect.call(this, key);
		else Selection.select.call(this, key);
	},

	clear<K>(this: TSelection<K>): void {
		if (this().size === 0) return;
		this().clear();
		this.notify();
	},

	selectAll<K>(this: TSelection<K>, allKeys: Iterable<K>): void {
		const keys = this();
		keys.clear();
		for (const key of allKeys) keys.add(key);
		this.notify();
	},

	allSelected<K>(this: TSelection<K>, universe: Iterable<K>): boolean {
		const keys = this();
		let any = false;
		for (const key of universe) {
			any = true;
			if (!keys.has(key)) return false;
		}
		return any;
	},

	partiallySelected<K>(this: TSelection<K>, universe: Iterable<K>): boolean {
		const keys = this();
		let selected = 0;
		let total = 0;
		for (const key of universe) {
			total++;
			if (keys.has(key)) selected++;
		}
		return selected > 0 && selected < total;
	},

	toggleAll<K>(this: TSelection<K>, universe: Iterable<K>): void {
		const keys = this();
		const selectAllOfIt = !Selection.allSelected.call(this, universe);
		for (const key of universe) {
			if (selectAllOfIt) keys.add(key);
			else keys.delete(key);
		}
		this.notify();
	},
};

const { select, deselect, toggle, clear, selectAll, toggleAll, allSelected, partiallySelected } = Selection;
function selection<K>(mode: TSelectionMode = 'single'): Selection<K> {
	const instance = signal(new Set<K>()) as TSelection<K>;
	instance.select = select;
	instance.deselect = deselect;
	instance.toggle = toggle;
	instance.clear = clear;
	instance.selectAll = selectAll;
	instance.toggleAll = toggleAll;
	instance.allSelected = allSelected;
	instance.partiallySelected = partiallySelected;
	instance[INTERNAL] = { mode };
	return instance;
}

export { Selection, selection };
