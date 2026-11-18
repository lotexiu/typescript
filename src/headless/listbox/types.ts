import { TListControlOptions } from '../list-control/types';

/** How many options a `Listbox` keeps selected. */
type TSelectionMode = 'single' | 'multiple';

/** Options of a `Listbox`. The value is the array of selected keys. */
type TListboxOptions<T, K> = TListControlOptions<T, K, readonly K[]> & {
	/** Default `single`. */
	readonly selectionMode?: TSelectionMode;
	/** Keep at least one option selected. */
	readonly disallowEmpty?: boolean;
};

export type { TSelectionMode, TListboxOptions };
