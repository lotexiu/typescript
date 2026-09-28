import { signal } from '@tsr-node/signal/model';
import { TAsyncState } from './types';

function asyncState<T, E = unknown>(initial?: T): TAsyncState<T, E> {
	const data = signal(initial);
	const loading = signal(false);
	const error = signal<E | undefined>(undefined);
	let generation = 0;

	async function run(task: () => Promise<T>): Promise<void> {
		// descarta o resultado se um `run` mais novo já tiver começado enquanto este esperava
		const current = ++generation;
		loading.set(true);
		error.set(undefined);
		try {
			const result = await task();
			if (current === generation) data.set(result);
		} catch (caught) {
			if (current === generation) error.set(caught as E);
		} finally {
			if (current === generation) loading.set(false);
		}
	}

	return { data, loading, error, run };
}

export { asyncState };
