import { LayerStack } from '../layer/model';
import { TListControlOptions } from '../list-control/types';
import { TWritable } from '../types';

/** Decides whether an option stays visible for the typed text. */
type TComboboxFilter = (label: string, text: string) => boolean;

/** Options of a `Combobox`. */
type TComboboxOptions<T, K> = TListControlOptions<T, K, K | undefined> & {
	/** Initial open state, or a writable to control it. */
	readonly open?: boolean | TWritable<boolean>;
	/** The text in the input. Pass a signal to control it from outside. */
	readonly inputValue?: string | TWritable<string>;
	/** Default: contains, ignoring case and accents. */
	readonly filter?: TComboboxFilter;
	/** Keep typed text that matches no option when the input loses focus. Default `false`: the text goes back to the chosen option's label. */
	readonly allowCustomValue?: boolean;
	/** Stack used to decide which overlay is on top. Default `LayerStack.shared`. */
	readonly layers?: LayerStack;
};

export type { TComboboxFilter, TComboboxOptions };
