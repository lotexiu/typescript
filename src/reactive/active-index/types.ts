import { TInternal } from '@tsn-object/types';
import { ActiveIndex } from './model';
import { Signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';

type TActiveIndex = ActiveIndex &
	TInternal<{
		length: TReactive<number>;
		internal: Signal<number>;
	}>;

export { TActiveIndex };
