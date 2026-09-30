import { computed } from '@tsr-node/computed/model';
import { debouncedValue } from '@tsr/debounced-value/model';
import { selection } from '@tsr/selection/model';
import { sort } from '@ts/composables/sort/model';
import { pagination } from '@ts/headless/pagination/model';
import { TList, TListConfig } from './types';

function defaultMatch(text: string, query: string): boolean {
	return text.toLowerCase().includes(query.toLowerCase());
}

function list<T, K>(config: TListConfig<T, K>): TList<T, K> {
	const { getKey, items, pageSize = 10, searchableText, sortValue, filterDelay = 0, matchesQuery = defaultMatch } = config;
	const readItems = typeof items === 'function' ? items : () => items;
	const readPageSize = typeof pageSize === 'number' ? () => pageSize : pageSize;

	const search = debouncedValue('', filterDelay);
	const sortState = sort<string>();
	const selectionState = selection<K>('multi');

	const filtered = computed<T[]>(() => {
		const query = search.debounced();
		const source = readItems();
		if (!query || !searchableText) return source;
		return source.filter((item) => matchesQuery(searchableText(item), query));
	});

	const sorted = computed<T[]>(() => {
		const key = sortState.key();
		if (!key || !sortValue) return filtered();
		const direction = sortState.direction();
		const rows = [...filtered()];
		rows.sort((a, b) => {
			const va = sortValue(a, key);
			const vb = sortValue(b, key);
			if (va === vb) return 0;
			const result = (va as any) < (vb as any) ? -1 : 1;
			return direction === 'DESC' ? -result : result;
		});
		return rows;
	});

	const paginationState = pagination({ totalItems: computed(() => sorted().length), pageSize });

	// re-sorting or re-searching changes what each page even means, so land back on page 1
	// instead of leaving the user on whatever page they happened to be on
	sortState.key.subscribe(() => paginationState.goToPage(1));
	sortState.direction.subscribe(() => paginationState.goToPage(1));
	search.debounced.subscribe(() => paginationState.goToPage(1));

	const rows = computed<T[]>(() => {
		const size = readPageSize();
		const start = (paginationState.currentPage() - 1) * size;
		return sorted().slice(start, start + size);
	});

	const allRowsSelected = computed(() => selectionState.allSelected(filtered().map(getKey)));
	const somePartiallySelected = computed(() => selectionState.partiallySelected(filtered().map(getKey)));

	function toggleSelectAll(): void {
		selectionState.toggleAll(filtered().map(getKey));
	}

	return {
		query: search,
		sort: sortState,
		pagination: paginationState,
		selection: selectionState,
		rows,
		filteredCount: computed(() => filtered().length),
		allRowsSelected,
		somePartiallySelected,
		toggleSelectAll,
	};
}

export { list };
