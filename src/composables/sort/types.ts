import { Signal } from '@tsr-node/signal/model';

type TSortDirection = 'ASC' | 'DESC';

type TSortConfig<K> = {
	initialKey?: K;
	/** Direction a key starts at when it's newly picked (by `toggle`, on a key that wasn't already active). Default `'ASC'`. */
	initialDirection?: TSortDirection;
};

type TSort<K> = {
	key: Signal<K | undefined>;
	direction: Signal<TSortDirection>;
	/** Same key as `key()` -> flips `direction`. Different key -> switches to it at `initialDirection`. */
	toggle(key: K): void;
	clear(): void;
};

export type { TSortDirection, TSortConfig, TSort };
