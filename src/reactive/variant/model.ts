import { Computed, computed } from '@tsr-node/computed/model';
import { Signal, signal } from '@tsr-node/signal/model';
import { TVariantDerive } from './types';
import { NODE } from '@tsr-node/declarations';

function variant<K, V>(derive: TVariantDerive<K, V>, initial: K): Variant<K, V> {
	const key = signal(initial);
	let instance = computed(() => derive(key())) as Variant<K, V>;
	instance.key = key;
	return instance;
}

type Variant<K, V> = Computed<V> & {
	key: Signal<K>;
	derive: TVariantDerive<K, V>;
};
const Variant = {
	[Symbol.hasInstance]: (value: any): boolean =>
		value instanceof Computed && value.key instanceof Signal,
};

export { variant, Variant };
