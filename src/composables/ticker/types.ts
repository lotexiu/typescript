import { Computed } from '@tsr-node/computed/model';

type TTickerOptions = {
	/** Starts right away. Default `false`. */
	autoStart?: boolean;
};

type TTicker = {
	/** How many ticks happened since the last `reset()`. Reading it inside a `computed` makes that `computed` re-run every tick. */
	count: Computed<number>;
	running: Computed<boolean>;
	start(): void;
	stop(): void;
	/** Zeroes `count` (keeps running if it was). */
	reset(): void;
	/** Stops and drops listeners. */
	dispose(): void;
};

export type { TTicker, TTickerOptions };
