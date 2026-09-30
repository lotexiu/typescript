import { computed } from '@tsr-node/computed/model';
import { signal } from '@tsr-node/signal/model';
import { activeIndex } from '@tsr/active-index/model';
import { asyncState } from '@ts/composables/async-state/model';
import { debouncedValue } from '@tsr/debounced-value/model';
import { selection } from '@tsr/selection/model';
import { toggle } from '@tsr/toggle/model';
import { TSelect, TSelectConfig } from './types';
import { SelectUtils } from './utils';

function select<T, K>(config: TSelectConfig<T, K>): TSelect<T, K> {
	const {
		getValue,
		getLabel,
		items = [],
		search,
		mode = 'single',
		filterDelay = 0,
		matchesQuery = SelectUtils.matchesQuery,
	} = config;
	const readItems: () => T[] = typeof items === 'function' ? items : () => items;

	const open = toggle(false);
	const searchText = debouncedValue('', filterDelay);
	const remote = search ? asyncState<T[]>([]) : undefined;
	const selectionState = selection<K>(mode);

	// items are remembered by key so `selectedItems` can still resolve a selection
	// after the option that made it selectable has scrolled out of `options()`
	// (narrower filter, page change, or a remote list replacing the old one).
	const known = new Map<K, T>();
	function remember(list: T[]): void {
		for (const item of list) known.set(getValue(item), item);
	}

	const options = computed<T[]>(() => {
		if (remote) return remote.data() ?? [];
		const query = searchText.debounced();
		const source = readItems();
		if (!query) return source;
		return source.filter((item) => matchesQuery(getLabel(item), query));
	});

	remember(readItems());
	options.subscribe(remember);

	if (remote) {
		searchText.debounced.subscribe((query) => {
			remote.run(() => search!(query));
		});
	}

	const active = activeIndex(computed(() => options().length));

	function selectOption(item: T): void {
		remember([item]);
		selectionState.toggle(getValue(item));
		searchText.set('');
		if (mode === 'single') open.off();
	}

	function activateAndSelect(): void {
		const item = options()[active()];
		if (item !== undefined) selectOption(item);
	}

	const selectedItems = computed<T[]>(() =>
		Array.from(selectionState())
			.map((key) => known.get(key))
			.filter((item): item is T => item !== undefined)
	);
	const selectedItem = computed<T | undefined>(() => selectedItems()[0]);
	const optionsAllSelected = computed(() => selectionState.allSelected(options().map(getValue)));
	const optionsPartiallySelected = computed(() => selectionState.partiallySelected(options().map(getValue)));

	function toggleAllOptions(): void {
		selectionState.toggleAll(options().map(getValue));
	}

	return {
		open,
		query: searchText,
		options,
		loading: remote ? remote.loading : signal(false),
		error: remote ? remote.error : signal(undefined),
		active,
		selection: selectionState,
		selectedItems,
		selectedItem,
		selectOption,
		activateAndSelect,
		optionsAllSelected,
		optionsPartiallySelected,
		toggleAllOptions,
	};
}

export { select };
