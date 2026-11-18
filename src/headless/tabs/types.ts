import { TListControlOptions } from '../list-control/types';

/** Whether moving the focus also selects (`automatic`) or waits for Enter/Space (`manual`). */
type TTabsActivation = 'automatic' | 'manual';

/** Options of `Tabs`. The value is the selected key. */
type TTabsOptions<T, K> = TListControlOptions<T, K, K | undefined> & {
	/** Default `automatic`. */
	readonly activation?: TTabsActivation;
};

export type { TTabsActivation, TTabsOptions };
