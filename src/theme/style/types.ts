import { TReactive } from '@tsr-node/types';
import Color from 'colorjs.io';

type SlotColor = {
	readonly id: string;
	readonly value: TReactive<Color>;
};

export { SlotColor };
