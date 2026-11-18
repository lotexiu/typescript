import { TListControlOptions } from '../list-control/types';
import { TMaybeReactive } from '../types';

/** Options of a `RadioGroup`. The value is the checked key. */
type TRadioGroupOptions<T, K> = TListControlOptions<T, K, K | undefined> & {
	/** Marks the group as required (`aria-required`). */
	readonly required?: TMaybeReactive<boolean>;
};

export type { TRadioGroupOptions };
