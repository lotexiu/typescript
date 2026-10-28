import { signal } from '@tsr-node/signal/model';
import { TSelection } from './types';
import { INTERNAL } from '@tsn-object/declarations';
import { computed, Computed } from '@tsr-node/computed/model';

type Selection<T> = Computed<T[]> & {
	/** Number of selected values. */
	size: Computed<number>;
	isEmpty: Computed<boolean>;
	has: (...values: T[]) => boolean;
	/** Replaces the whole selection (a single notification). */
	set: (values: Iterable<T>) => void;
	select: (...values: T[]) => void;
	deselect: (...values: T[]) => void;
	toggle: (...values: T[]) => void;
	clear: () => void;
};
const Selection = {
	has<T>(this: TSelection<T>, ...values: T[]): boolean {
		const valueSet = this[INTERNAL]();
		return values.every((value) => valueSet.has(value));
	},

	select<T>(this: TSelection<T>, ...values: T[]): void {
		const internal = this[INTERNAL];
		values.forEach((value) => internal().add(value));
		internal.notify();
	},

	deselect<T>(this: TSelection<T>, ...values: T[]): void {
		const internal = this[INTERNAL];
		values.forEach((value) => internal().delete(value));
		internal.notify();
	},

	toggle<T>(this: TSelection<T>, ...values: T[]): void {
		const internal = this[INTERNAL];
		values.forEach((value) => {
			if (internal().has(value)) {
				internal().delete(value);
			} else {
				internal().add(value);
			}
		});
		internal.notify();
	},

	set<T>(this: TSelection<T>, values: Iterable<T>): void {
		const internal = this[INTERNAL];
		const next = [...values];
		internal().clear();
		next.forEach((value) => internal().add(value));
		internal.notify();
	},

	clear<T>(this: TSelection<T>): void {
		const internal = this[INTERNAL];
		internal().clear();
		internal.notify();
	},
};

const { has, select, deselect, toggle, set, clear } = Selection;

function selection<T>(initial: Iterable<T> = []) {
	const internal = signal<Set<T>>(new Set([...initial]));
	const instance = computed<T[]>(() => [...internal()]) as TSelection<T>;
	instance.has = has;
	instance.select = select;
	instance.deselect = deselect;
	instance.toggle = toggle;
	instance.set = set;
	instance.clear = clear;
	instance.size = computed(() => internal().size);
	instance.isEmpty = computed(() => internal().size === 0);
	instance[INTERNAL] = internal;
	return instance;
}

export { Selection, selection };
