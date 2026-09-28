import { Signal, signal } from '@tsr-node/signal/model';
import { TEqual } from '@tsr-node/types';
import { ToggleUtils } from './utils';

function toggle(initial = false, equal?: TEqual<boolean>): Toggle {
	const instance = signal(initial, equal) as Toggle;
	instance.on = ToggleUtils.on;
	instance.off = ToggleUtils.off;
	instance.toggle = ToggleUtils.toggle;
	return instance;
}

type Toggle = Signal<boolean> & {
	on(): void;
	off(): void;
	toggle(): void;
};
const Toggle = {
	[Symbol.hasInstance]: (value: any): boolean =>
		value instanceof Signal && value.toggle === ToggleUtils.toggle,
};

export { toggle, Toggle };
