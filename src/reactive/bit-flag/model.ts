import { TRecord } from '@tsn-object/types';
import { bitEnum } from '@tsn/bitwise/utils';
import { Signal, signal } from '@tsr-node/signal/model';
import { BitFlagUtils } from './utils';

const { disable, disabled, enable, enabled, toggle, reset } = BitFlagUtils;

function bitFlag<T extends string[]>(...keys: T) {
	const flags = bitEnum('NONE', ...keys);
	const instance = signal(flags.NONE) as BitFlag<T[number]>;
	instance.toggle = toggle;
	instance.disable = disable;
	instance.enable = enable;
	instance.enabled = enabled;
	instance.disabled = disabled;
	instance.reset = reset;
	instance.flags = flags;
	return instance;
}

type BitFlag<T> = Signal<number> & {
	toggle: (...flags: number[]) => void;
	disable: (...flags: number[]) => void;
	enable: (...flags: number[]) => void;
	enabled: (some: boolean, ...flags: number[]) => boolean;
	disabled: (some: boolean, ...flags: number[]) => boolean;
	reset: () => void;
	flags: TRecord<['NONE' | T, number]>;
};
const BitFlag = {
	[Symbol.hasInstance](instance: any) {
		return instance instanceof Signal && instance.toggle === toggle;
	},
};

export { bitFlag, BitFlag };
