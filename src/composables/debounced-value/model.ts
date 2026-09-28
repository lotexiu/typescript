import { FunctionUtils } from '@tsn-function/utils';
import { computed } from '@tsr-node/computed/model';
import { signal } from '@tsr-node/signal/model';
import { TEqual, TReactive } from '@tsr-node/types';
import { TDebouncedValue } from './types';

function debouncedValue<T>(
	initial: T,
	delay: TReactive<number> | number,
	equal?: TEqual<T>
): TDebouncedValue<T> {
	const value = signal(initial, equal);
	const settled = signal(initial, equal);
	value.subscribe(FunctionUtils.debounce(() => settled.set(value()), delay));
	return {
		value,
		debounced: computed(() => settled()),
	};
}

export { debouncedValue };
