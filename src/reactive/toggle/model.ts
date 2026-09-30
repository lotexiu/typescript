import { Signal, signal } from '@tsr-node/signal/model';
import { TEqual } from '@tsr-node/types';

type Toggle = Signal<boolean> & {
	on(): void;
	off(): void;
	toggle(): void;
};
const Toggle = {
	[Symbol.hasInstance](instance: any): instance is Toggle {
		return instance.toggle === Toggle.toggle && instance instanceof Signal;
	},

	on(this: Signal<boolean>): void {
		this.set(true);
	},

	off(this: Signal<boolean>): void {
		this.set(false);
	},

	toggle(this: Signal<boolean>): void {
		this.update((value) => !value);
	},
};

const { on, off, toggle: toggleFn } = Toggle;

function toggle(initial = false, equal?: TEqual<boolean>): Toggle {
	const instance = signal(initial, equal) as Toggle;
	instance.on = on;
	instance.off = off;
	instance.toggle = toggleFn;
	return instance;
}

export { toggle, Toggle };
