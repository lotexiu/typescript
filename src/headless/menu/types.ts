import { LayerStack } from '../layer/model';
import { TListControlOptions } from '../list-control/types';

/** Options of a `Menu`. The value is whether the menu is open. */
type TMenuOptions<T, K> = TListControlOptions<T, K, boolean> & {
	/** Called when an item is activated (click, Enter or Space). */
	readonly onAction?: (key: NoInfer<K>, item: NoInfer<T>) => void;
	/** Close after an item is activated. Default `true`. */
	readonly closeOnAction?: boolean;
	/** Stack used to decide which overlay is on top. Default `LayerStack.shared`. */
	readonly layers?: LayerStack;
};

export type { TMenuOptions };
