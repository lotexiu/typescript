import { computed } from '@ts/reactive-node/computed/model';
import { TComputed, TReadable, TSignal } from '@ts/reactive-node/types';
import { TField, TFieldGet, TFieldSet } from './types';

// Qualquer outro signal lido dentro de `get` vira dependência automaticamente.
function readField<S, V>(source: TReadable<S>, get: TFieldGet<S, V>): TComputed<V> {
	return computed(() => get(source()));
}

function field<S, V>(source: TSignal<S>, get: TFieldGet<S, V>, set: TFieldSet<S, V>): TField<V> {
	const instance = computed(() => get(source())) as TField<V>;
	// Closures (e não métodos com `this`): continuam funcionando se forem extraídas da instância.
	instance.set = (value: V): boolean => {
		const previous = instance();
		set(source(), value);
		source.notify();
		return !Object.is(previous, instance());
	};
	instance.update = (fn: (value: V) => V): boolean => instance.set(fn(instance()));
	return instance;
}

export { readField, field };
