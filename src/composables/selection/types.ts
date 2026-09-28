import { Signal } from '@tsr-node/signal/model';

type TSelectionMode = 'single' | 'multi';

type TSelection<K> = {
	keys: Signal<Set<K>>;
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

export type { TSelectionMode, TSelection };
