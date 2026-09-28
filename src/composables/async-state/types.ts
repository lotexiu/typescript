import { Signal } from '@tsr-node/signal/model';

type TAsyncState<T, E = unknown> = {
	data: Signal<T | undefined>;
	loading: Signal<boolean>;
	error: Signal<E | undefined>;
	run(task: () => Promise<T>): Promise<void>;
};

export type { TAsyncState };
