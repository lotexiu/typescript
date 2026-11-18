import { TControlOptions } from '../control/types';
import { TMaybeReactive } from '../types';

/** `true`, `false`, or `'mixed'` for an indeterminate box (some children checked). */
type TCheckedState = boolean | 'mixed';

/** The checked state as a `data-state` word. */
type TCheckboxState = 'checked' | 'unchecked' | 'indeterminate';

/** Options of a `Checkbox`. */
type TCheckboxOptions = TControlOptions<TCheckedState> & {
	/** Marks the box as required (`aria-required`). */
	readonly required?: TMaybeReactive<boolean>;
};

export type { TCheckedState, TCheckboxState, TCheckboxOptions };
