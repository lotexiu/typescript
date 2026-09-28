import { Signal } from '@tsr-node/signal/model';

type TActiveIndexOptions = {
	/** Wrap past the first/last item instead of stopping there. Default `true`. */
	loop?: boolean;
};

type TActiveIndex = {
	/** `-1` means no item is active. */
	index: Signal<number>;
	next(): void;
	prev(): void;
	first(): void;
	last(): void;
	clear(): void;
};

export type { TActiveIndexOptions, TActiveIndex };
