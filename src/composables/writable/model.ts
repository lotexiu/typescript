import { Computed, computed } from '@tsr-node/computed/model';
import { Signal } from '@tsr-node/signal/model';
import { TReactiveSet, TReactiveUpdate } from '@tsr-node/types';

/** A computed with `set`/`update` that write through a function. */
type Writable<T> = Computed<T> & {
	set: TReactiveSet<T>;
	update: TReactiveUpdate<T>;
};

/**
 * Bridges any state to the signal world: reads through `read` (tracked) and writes through `write`.
 * `set` returns whether the read value changed.
 * @example
 * const dark = writable(() => theme.mode() === 'dark', (value) => theme.mode.set(value ? 'dark' : 'light'))
 */
function writable<T>(read: () => T, write: (value: T) => void): Writable<T> {
	const instance = computed(read) as Writable<T>;
	instance.set = (value: T): boolean => {
		const previous = Signal.untracked(instance);
		write(value);
		return !Object.is(previous, Signal.untracked(instance));
	};
	instance.update = (change) => instance.set(change(Signal.untracked(instance)));
	return instance;
}

export { writable };
export type { Writable };
