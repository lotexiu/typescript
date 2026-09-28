import { Signal, signal } from '@tsr-node/signal/model';
import { TEqual } from '@tsr-node/types';
import { TSyncedValueRead, TSyncedValueWrite } from './types';

function syncedValue<T>(
	read: TSyncedValueRead<T>,
	write?: TSyncedValueWrite<T>,
	equal?: TEqual<T>
): Signal<T> {
	const instance = signal(read(), equal);
	if (!write) return instance;

	const { set, update } = instance;
	instance.set = function (this: Signal<T>, next: T): boolean {
		const changed = set.call(this, next);
		if (changed) write(next);
		return changed;
	};
	instance.update = function (this: Signal<T>, fn: (value: T) => T): boolean {
		const changed = update.call(this, fn);
		if (changed) write(this());
		return changed;
	};
	return instance;
}

export { syncedValue };
