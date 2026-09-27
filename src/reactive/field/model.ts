import { Computed, computed } from '@tsr-node/computed/model';
import { Signal } from '@tsr-node/signal/model';
import { TField, TFieldGet, TFieldSet } from './types';
import { INTERNAL } from '@tsn-object/declarations';
import { FieldUtils } from './utils';

const { set, update } = FieldUtils;

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

type Field<V> = Computed<V> & {
	set(value: V): boolean;
	update(fn: (value: V) => V): boolean;
};
const Field = {
	[Symbol.hasInstance]: (value: any): boolean => value instanceof Computed && value.set === set,
};

export { field, Field };
