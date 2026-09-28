import { Computed } from '@tsr-node/computed/model';
import { Signal } from '@tsr-node/signal/model';

type TDebouncedValue<T> = {
	value: Signal<T>;
	debounced: Computed<T>;
};

export type { TDebouncedValue };
