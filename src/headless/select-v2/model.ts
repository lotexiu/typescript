import { asyncState } from '@ts/composables/async-state/model';
import { computed } from '@tsr-node/computed/model';
import { signal } from '@tsr-node/signal/model';
import { debouncedValue } from '@tsr/debounced-value/model';
import { selection } from '@tsr/selection/model';
import { TSelectionMode } from '@tsr/selection/types';

/* Outside */

function search(): Promise<number[]> {
	return new Promise((resolve) => resolve([1, 2, 3]));
}

/* Internal */

function select<T>(search: Promise<T[]>) {
	const open = signal(false);
	const mode = signal<TSelectionMode>('single');

	const searchText = debouncedValue('', 250);
	const { data, error, loading, run } = asyncState([]);

	const options = computed(() => {
		if (loading()) return [];
		return data() ?? [];
	});

	const values = selection<T>();
	const { deselect: remove, toggle, select: add } = values;

	return {
		open,
		mode,
		options,
		add,
		remove,
		toggle,
	};
}
