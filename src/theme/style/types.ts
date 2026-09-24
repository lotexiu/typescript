import { TReadable } from '@ts/signal/types';
import Color from 'colorjs.io';

type SlotColor = {
	readonly id: string;
	readonly value: TReadable<Color>;
};

export { SlotColor };
