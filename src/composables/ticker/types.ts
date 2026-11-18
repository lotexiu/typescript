import { Computed } from '@tsr-node/computed/model';

/** Options of `ticker`. */
type TTickerOptions = {
	/** Starts right away. Default `false`. */
	autoStart?: boolean;
};

/** What `ticker` returns. */
type TTicker = {
	/** How many ticks happened since the last `reset()`. Reading it inside a `computed` makes that `computed` re-run every tick. */
	count: Computed<number>;
	/** Whether it is ticking. */
	running: Computed<boolean>;
	/** Starts ticking (no effect when running). */
	start(): void;
	/** Stops ticking, keeping the count. */
	stop(): void;
	/** Zeroes `count` (keeps running if it was). */
	reset(): void;
	/** Stops and drops listeners. */
	dispose(): void;
};

export type { TTicker, TTickerOptions };
