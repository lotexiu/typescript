import { signal } from '@tsr-node/signal/model';
import { TSort, TSortConfig } from './types';

/**
 * Sort state of a table: a key and a direction. Toggling the same key flips the direction; another key starts over.
 */
function sort<K>(config: TSortConfig<K> = {}): TSort<K> {
	const { initialKey, initialDirection = 'ASC' } = config;
	const key = signal(initialKey);
	const direction = signal(initialDirection);

	function toggle(next: K): void {
		if (key() === next) {
			direction.set(direction() === 'ASC' ? 'DESC' : 'ASC');
			return;
		}
		key.set(next);
		direction.set(initialDirection);
	}

	function clear(): void {
		key.set(undefined);
		direction.set(initialDirection);
	}

	return { key, direction, toggle, clear };
}

export { sort };
