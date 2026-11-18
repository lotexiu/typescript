import { Computed, computed } from '@tsr-node/computed/model';
import { Signal, signal } from '@tsr-node/signal/model';
import { TVariantDerive } from './types';

/** A value derived from a key: changing `key` recomputes the value with `derive`. */
function variant<K, V>(derive: TVariantDerive<K, V>, initial: K): Variant<K, V> {
	const key = signal(initial);
	const instance = computed(() => derive(key())) as Variant<K, V>;
	instance.key = key;
	instance.derive = derive;
	return instance;
}

/** What `variant` returns: the derived value, its `key` signal and `derive`. */
type Variant<K, V> = Computed<V> & {
	key: Signal<K>;
	derive: TVariantDerive<K, V>;
};
/** The `instanceof` check of `variant` instances. */
const Variant = {
	[Symbol.hasInstance](instance: any): instance is Variant<any, any> {
		return instance.key instanceof Signal && instance instanceof Computed;
	},
};

export { variant, Variant };
