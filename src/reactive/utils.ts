import { FunctionUtils } from '@tsn-function/utils';
import { Computed, computed } from '@tsr-node/computed/model';
import { signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';
import { bitFlag } from './bit-flag/model';

class ReactiveUtils {
	static external<T>(initial: T, process: Computed<T>, debounce?: TReactive<number>) {
		const input = signal(initial);
		const value = signal(initial);

		if (debounce) {
			input.subscribe(
				FunctionUtils.debounce(() => {
					value.set(process());
				}, debounce)
			);
		} else {
			input.subscribe(() => {
				value.set(process());
			});
		}

		const output = computed(() => value());

		return {
			input,
			value,
			output,
		};
	}
}

export { ReactiveUtils };
