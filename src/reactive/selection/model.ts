import { signal } from '@tsr-node/signal/model';
import { TSelection, TSelectionMode } from './types';
import { INTERNAL } from '@tsn-object/declarations';
import { computed, Computed } from '@tsr-node/computed/model';
import { TLazy } from '@tsn-function/types';

type Selection<T> = Computed<T[]> & {
	has: (...values: T[]) => boolean;
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

	clear<T>(this: TSelection<T>): void {
		const internal = this[INTERNAL];
		internal().clear();
		internal.notify();
	},
};

const { has, select, deselect, toggle, clear } = Selection;

function selection<T>(mode: TLazy<TSelectionMode> = 'single', initial: Iterable<T> = []) {
	const internal = signal<Set<T>>(new Set([...initial]));
	const instance = computed<T[]>(() => [...internal()]) as TSelection<T>;
	instance.has = has;
	instance.select = select;
	instance.deselect = deselect;
	instance.toggle = toggle;
	instance.clear = clear;
	instance[INTERNAL] = internal;
	return instance;
}

export { Selection, selection };
