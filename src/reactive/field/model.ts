import { Computed, computed } from '@tsr-node/computed/model';
import { Signal } from '@tsr-node/signal/model';
import { TField, TFieldGet, TFieldSet } from './types';
import { INTERNAL } from '@tsn-object/declarations';
import { TReactiveSet, TReactiveUpdate } from '@tsr/types';

type Field<V> = Computed<V> & {
	set: TReactiveSet<V>;
	update: TReactiveUpdate<V>;
};
const Field = {
	[Symbol.hasInstance](instance: any): instance is Field<any> {
		return instance.set === set && instance instanceof Computed;
	},

	set<S, V>(this: TField<S, V>, value: V): boolean {
		const previous = this();
		const { setter, source } = this[INTERNAL];
		setter(source(), value);
		source.notify();
		return !Object.is(previous, this());
	},

	update<S, V>(this: TField<S, V>, fn: (value: V) => V): boolean {
		return this.set(fn(this()));
	},
};

const { set, update } = Field;

function field<S, V>(
	source: Signal<S>,
	getter: TFieldGet<S, V>,
	setter: TFieldSet<S, V>
): Field<V> {
	const instance = computed(() => getter(source())) as TField<S, V>;
	instance.set = set;
	instance.update = update;
	instance[INTERNAL] = { getter, setter, source };
	return instance;
}

export { field, Field };
