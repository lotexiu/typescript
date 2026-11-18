import { NODE } from '@tsr-node/declarations';
import { ReactiveNode } from '@tsr-node/model';
import { TEqual, TReactive } from '@tsr-node/types';
import { ReactiveNodeUtils } from '@tsr-node/utils';

const { set, subscribe, dispose, version } = ReactiveNodeUtils;

/**
 * A value derived from signals: dependencies are tracked automatically and the value is recomputed lazily when one changes.
 * Writing to a signal inside `compute` throws.
 * @example
 * const count = signal(1)
 * const double = computed(() => count() * 2)
 * double() // 2
 */
function computed<T>(compute: () => T, equal?: TEqual<T>): Computed<T> {
	const node = ReactiveNode.computed(compute, equal);
	const instance: any = () => node.read();
	instance[NODE] = node;
	instance.subscribe = subscribe;
	instance.dispose = dispose;
	instance.version = version;
	return instance;
}

/** A read-only reactive value. */
type Computed<T> = TReactive<T>;
/** The `instanceof` check of computed values. */
const Computed = {
	[Symbol.hasInstance](instance: any): instance is Computed<any> {
		return typeof instance === 'function' && instance[NODE] !== undefined && instance.set !== set;
	},
};

export { Computed, computed };
