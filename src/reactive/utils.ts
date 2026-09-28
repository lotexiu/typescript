import { FunctionUtils } from '@tsn-function/utils';
import { Computed, computed } from '@tsr-node/computed/model';
import { signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';
import { bitFlag } from './bit-flag/model';

class ReactiveUtils {
	static inputProcess<T, V>(
		initial: T,
		process: Computed<V>,
		debounce?: TReactive<number> | number
	) {
		const input = signal(initial);
		const value = signal(process());

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
			output,
			value,
		};
	}
}

/*  Ainda pensando...
function component<T, V>(initial: T, process: Computed<V>, debounce?: TReactive<number> | number) {
	const state = bitFlag('disabled', 'focused', 'hovered', 'pressing');
	const { flags } = state;

	const { input, output, value } = ReactiveUtils.inputProcess(
		initial,
		computed((): V => {
			if (state.enabled(flags.disabled)) return value();
			return process();
		}),
		debounce
	);

	return {
		state,
		input,
		output,
		value,
	};
}
 */
export { ReactiveUtils };
