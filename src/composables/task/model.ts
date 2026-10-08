import { TFn } from '@tsn-function/types';
import { FunctionUtils } from '@tsn-function/utils';
import { signal } from '@tsr-node/signal/model';

async function task<Args extends any[], T, E = unknown>(
	fn: TFn<Args, Promise<T>>,
	debounceValue = 0
) {
	const data = signal<T>();
	const loading = signal(false);
	const error = signal<E>();
	const debounce = signal(debounceValue);
	let generation = 0;

	const run = FunctionUtils.debounce(async (...args: Args) => {
		const current = ++generation;
		loading.set(true);
		error.set(undefined);
		try {
			const result = await fn.apply(null, args);
			if (current === generation) data.set(result);
		} catch (caught) {
			if (current === generation) error.set(caught as E);
		} finally {
			if (current === generation) loading.set(false);
		}
	}, debounce);

	return { run, data, loading, error, debounce };
}

export { task };
