import { TCollectionOptions } from '../collection/types';
import { TControlOptions } from '../control/types';
import { TNavigationOptions } from '../navigation/types';
import { TOrientation } from '../types';

/** Axis of a list: `both` reacts to all four arrows (radio groups). */
type TListOrientation = TOrientation | 'both';

/**
 * Options of controls built on a list of items: control options + collection accessors + navigation behavior.
 */
type TListControlOptions<T, K, V> = TControlOptions<V> &
	TCollectionOptions<T, K> &
	TNavigationOptions & {
		/** Which arrows move the highlight. Each control has its own default. */
		readonly orientation?: TOrientation;
		/** Jump to the next item whose label starts with the typed text. */
		readonly typeahead?: boolean;
	};

export type { TListOrientation, TListControlOptions };
