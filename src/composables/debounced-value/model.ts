import { TLazy } from '@tsn-function/types';
import { FunctionUtils } from '@tsn-function/utils';
import { Computed, computed } from '@tsr-node/computed/model';
import { Signal, signal } from '@tsr-node/signal/model';
import { TEqual } from '@tsr-node/types';

/**
 * A signal for the live value, with `debounced` holding the last value that
 * stayed unchanged for `delay` ms. `dispose()` drops the subscription that feeds `debounced`.
 */
type DebouncedValue<T> = Signal<T> & {
	debounced: Computed<T>;
};
/** The `instanceof` check of `debouncedValue` instances. */
const DebouncedValue = {
	[Symbol.hasInstance](instance: any): instance is DebouncedValue<any> {
		return typeof instance === 'function' && instance.debounced instanceof Computed && instance instanceof Signal;
	},
};

/**
 * A signal for the live value plus `debounced`, the last value that stayed unchanged for `delay` ms — e.g. a search box.
 */
function debouncedValue<T>(
	initial: T,
	delay: TLazy<number>,
	equal?: TEqual<T>
): DebouncedValue<T> {
	const instance = signal(initial, equal) as DebouncedValue<T>;
	const settled = signal(initial, equal);
	instance.subscribe(FunctionUtils.debounce(() => settled.set(instance()), delay));
	instance.debounced = computed(() => settled());
	return instance;
}

export { DebouncedValue, debouncedValue };
