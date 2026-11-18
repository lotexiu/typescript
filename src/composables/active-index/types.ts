import { TInternal } from '@tsn-object/types';
import { ActiveIndex } from './model';
import { Signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';

/** @internal */
type TActiveIndex = ActiveIndex &
	TInternal<{
		length: TReactive<number>;
		internal: Signal<number>;
		wrap: boolean;
	}>;

/** Options of `activeIndex`. */
type TActiveIndexOptions = {
	/** `true` (default): moving past either end wraps around. `false`: stops at the ends. */
	wrap?: boolean;
};

export { TActiveIndex, TActiveIndexOptions };
