import { Computed, computed } from '@tsr-node/computed/model';
import { signal } from '@tsr-node/signal/model';
import { TActiveIndex } from './types';
import { INTERNAL } from '@tsn-object/declarations';
import { TReactive } from '@tsr-node/types';

/** `-1` means no item is active. */
const NONE = -1;

/**
 * Index arithmetic (next/prev, wraparound) over a list whose length can change —
 * e.g. options narrowed by a text filter. Doesn't know what the list contains;
 * resolving `activeIndex()` to an item is the caller's job.
 *
 * The value read is always inside `[0, length)` or `-1`: if the list shrinks below
 * the stored index, the read is clamped to the last item.
 */
type ActiveIndex = Computed<number> & {
	set: (value: number) => void;
	update(fn: (value: number) => number): void;
	next: () => void;
	prev: () => void;
	reset: () => void;
};
const ActiveIndex = {
	[Symbol.hasInstance](instance: any): instance is ActiveIndex {
		return typeof instance === 'function' && instance.next === ActiveIndex.next && instance instanceof Computed;
	},

	/** `NONE` clears the active item; any other value wraps into `[0, length)`. */
	set(this: TActiveIndex, value: number) {
		const { length, internal } = this[INTERNAL];
		internal.set(value === NONE ? NONE : ActiveIndex.resolve(value, length()));
	},

	/** `fn` receives the value as read (already clamped), not the raw stored one. */
	update(this: TActiveIndex, fn: (value: number) => number) {
		const { length, internal } = this[INTERNAL];
		internal.set(ActiveIndex.resolve(fn(this()), length()));
	},

	next(this: TActiveIndex) {
		// from NONE, -1 + 1 lands on the first item
		this.update((value) => value + 1);
	},

	prev(this: TActiveIndex) {
		const { length } = this[INTERNAL];
		this.update((value) => (value === NONE ? length() - 1 : value - 1));
	},

	reset(this: TActiveIndex) {
		const { internal } = this[INTERNAL];
		internal.set(NONE);
	},

	/** Wraps `value` into `[0, length)`; an empty list has nothing to point at. */
	resolve(value: number, length: number) {
		if (length <= 0) return NONE;
		return ((value % length) + length) % length;
	},

	/** Read-side counterpart of `resolve`: keeps the stored index valid when `length` shrinks. */
	clamp(value: number, length: number) {
		if (length <= 0 || value < 0) return NONE;
		return Math.min(value, length - 1);
	},
};

const { set, update, next, prev, reset, clamp } = ActiveIndex;
function activeIndex(length: TReactive<number>) {
	const internal = signal(NONE);
	const instance = computed(() => clamp(internal(), length())) as TActiveIndex;
	instance.set = set;
	instance.update = update;
	instance.next = next;
	instance.prev = prev;
	instance.reset = reset;
	instance[INTERNAL] = {
		internal,
		length,
	};

	return instance;
}

export { ActiveIndex, activeIndex };
