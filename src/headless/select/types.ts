import { LayerStack } from '../layer/model';
import { TListControlOptions } from '../list-control/types';
import { TWritable } from '../types';

/** Options of a `Select`. The value is the chosen key. */
type TSelectOptions<T, K> = TListControlOptions<T, K, K | undefined> & {
	/** Initial open state, or a writable to control it. */
	readonly open?: boolean | TWritable<boolean>;
	/** Stack used to decide which overlay is on top. Default `LayerStack.shared`. */
	readonly layers?: LayerStack;
};

export type { TSelectOptions };
