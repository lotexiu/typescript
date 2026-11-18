import { Signal } from '@tsr-node/signal/model';

/** Ascending or descending. */
type TSortDirection = 'ASC' | 'DESC';

/** Initial state of `sort`. */
type TSortConfig<K> = {
	/** Key sorted at first. */
	initialKey?: K;
	/** Direction a key starts at when it's newly picked (by `toggle`, on a key that wasn't already active). Default `'ASC'`. */
	initialDirection?: TSortDirection;
};

/** What `sort` returns. */
type TSort<K> = {
	/** Sorted key, or `undefined`. */
	key: Signal<K | undefined>;
	/** Current direction. */
	direction: Signal<TSortDirection>;
	/** Same key as `key()` -> flips `direction`. Different key -> switches to it at `initialDirection`. */
	toggle(key: K): void;
	/** Back to unsorted. */
	clear(): void;
};

export type { TSortDirection, TSortConfig, TSort };
