import { Computed } from '@tsr-node/computed/model';
import { Signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';
import { TActiveIndex } from '@ts/composables/active-index/types';
import { TSelection, TSelectionMode } from '@ts/composables/selection/types';
import { Toggle } from '@tsr/toggle/model';

type TSelectConfig<T, K> = {
	getValue: (item: T) => K;
	getLabel: (item: T) => string;
	/** Local/static source. Required when `search` isn't given. */
	items?: TReactive<T[]> | T[];
	/** When given, `options` comes from here (with `loading`/`error`) instead of filtering `items` locally. */
	search?: (query: string) => Promise<T[]>;
	mode?: TSelectionMode;
	/** Debounce (ms) before `query` changes are acted on — local filter or `search`. Default `0`. */
	filterDelay?: TReactive<number> | number;
	/** Overrides the default accent/case-insensitive substring match. Only used when `search` isn't given. */
	matchesQuery?: (label: string, query: string) => boolean;
};

type TSelect<T, K> = {
	open: Toggle;
	/** Raw, live text as typed — settle time is `filterDelay`. */
	query: Signal<string>;
	/** The effective list to render: locally filtered `items`, or the latest `search` result. */
	options: Computed<T[]>;
	loading: Signal<boolean>;
	error: Signal<unknown>;
	active: TActiveIndex;
	selection: TSelection<K>;
	selectedItems: Computed<T[]>;
	/** Convenience for single-select UIs: `selectedItems()[0]`. */
	selectedItem: Computed<T | undefined>;
	/** Toggles the item's selection, clears `query`, and closes `open` in single mode. */
	selectOption(item: T): void;
	/** Selects whatever `active.index` currently points to in `options()`, if any. */
	activateAndSelect(): void;
	/** Multi mode "select all" master checkbox: true when every currently visible `options()` is selected. */
	optionsAllSelected: Computed<boolean>;
	/** Multi mode master checkbox indeterminate state: some but not all of `options()` is selected. */
	optionsPartiallySelected: Computed<boolean>;
	/** Multi mode "select all" master checkbox handler: selects all of `options()`, or clears them if all are already selected. */
	toggleAllOptions(): void;
};

export type { TSelectConfig, TSelect };
