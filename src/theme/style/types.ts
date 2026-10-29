import { TReactive } from '@tsr-node/types';
import { TColor } from '../color/types';

type SlotColor = {
	readonly id: string;
	readonly value: TReactive<TColor>;
};

export type { SlotColor };
