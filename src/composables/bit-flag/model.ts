import { TRecord } from '@tsn-object/types';
import { bitEnum } from '@tsn/bitwise/utils';
import { Signal, signal } from '@tsr-node/signal/model';

/** A signal holding several on/off flags in one number, with named flags and set operations. */
type BitFlag<T> = Signal<number> & {
	toggle: (...flags: number[]) => void;
	disable: (...flags: number[]) => void;
	enable: (...flags: number[]) => void;
	enabled: (...flags: number[]) => boolean;
	disabled: (...flags: number[]) => boolean;
	reset: () => void;
	flags: TRecord<['none' | T, number]>;
};
/** Methods shared by every instance (assigned to each one) and the `instanceof` check. */
const BitFlag = {
	[Symbol.hasInstance](instance: any): instance is BitFlag<any> {
		return instance.toggle === toggle && instance instanceof Signal;
	},

	toggle(this: Signal<number>, ...flags: number[]) {
		if (flags.length === 1) this.set(this() ^ flags[0]);
		else this.set(flags.reduce((acc, flag) => acc ^ flag, this()));
	},

	disable(this: Signal<number>, ...flags: number[]) {
		if (flags.length === 1) this.set(this() & ~flags[0]);
		else this.set(flags.reduce((acc, flag) => acc & ~flag, this()));
	},

	enable(this: Signal<number>, ...flags: number[]) {
		if (flags.length === 1) this.set(this() | flags[0]);
		else this.set(flags.reduce((acc, flag) => acc | flag, this()));
	},

	enabled(this: Signal<number>, ...flags: number[]): boolean {
		if (flags.length === 1) return Boolean(this() & flags[0]);
		return flags.every((flag) => this() & flag);
	},

	disabled(this: Signal<number>, ...flags: number[]): boolean {
		if (flags.length === 1) return !(this() & flags[0]);
		return flags.every((flag) => !(this() & flag));
	},

	reset(this: Signal<number>) {
		this.set(0);
	},
};

const { disable, disabled, enable, enabled, toggle, reset } = BitFlag;

/**
 * Creates a `BitFlag` with one flag per key (`none` is 0).
 * @example
 * const state = bitFlag('hovered', 'pressed')
 * state.enable(state.flags.hovered)
 */
function bitFlag<T extends string[]>(...keys: T) {
	const flags = bitEnum('none', ...keys);
	const instance = signal(flags.none) as BitFlag<T[number]>;
	instance.toggle = toggle;
	instance.disable = disable;
	instance.enable = enable;
	instance.enabled = enabled;
	instance.disabled = disabled;
	instance.reset = reset;
	instance.flags = flags;
	return instance;
}

export { bitFlag, BitFlag };
