import { Computed } from '@tsr-node/computed/model';
import { Signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';
import { TSort } from '@ts/composables/sort/types';
import { Selection } from '@tsr/selection/model';
import { TPagination } from '@ts/headless/pagination/types';

type TListConfig<T, K> = {
	getKey: (item: T) => K;
	items: TReactive<T[]> | T[];
	pageSize?: TReactive<number> | number;
	/** Enables local text search over `query`. Omit to disable search entirely. */
	searchableText?: (item: T) => string;
	/** Value to compare for a given `sort.key`. Omit to disable sorting entirely. */
	sortValue?: (item: T, key: string) => unknown;
	/** Debounce (ms) before `query` changes are acted on. Default `0`. */
	filterDelay?: TReactive<number> | number;
	/** Overrides the default case-insensitive substring match. */
	matchesQuery?: (text: string, query: string) => boolean;
};

type TList<T, K> = {
	query: Signal<string>;
	sort: TSort<string>;
	pagination: TPagination;
	selection: Selection<K>;
	/** The current page's rows, after search + sort + pagination. */
	rows: Computed<T[]>;
	/** How many items match the current search, across every page. */
	filteredCount: Computed<number>;
	/** True when every item matching the current search — across every page, not just `rows` — is selected. */
	allRowsSelected: Computed<boolean>;
	/** The master checkbox's indeterminate state. */
	somePartiallySelected: Computed<boolean>;
	/** Selects every filtered item (every page) if not all are already selected, otherwise clears them. */
	toggleSelectAll(): void;
};

export type { TListConfig, TList };
