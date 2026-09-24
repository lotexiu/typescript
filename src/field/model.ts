import { derived } from '@ts/signal/model';
import { TDerived, TReadable, TSignal } from '@ts/signal/types';
import { TField, TFieldGet, TFieldSet } from './types';

// Qualquer outro signal lido dentro de `get` vira dependência automaticamente.
function readField<S, V>(source: TReadable<S>, get: TFieldGet<S, V>): TDerived<V> {
	return derived(() => get(source()));
}

function field<S, V>(source: TSignal<S>, get: TFieldGet<S, V>, set: TFieldSet<S, V>): TField<V> {
	const instance = derived(() => get(source())) as TField<V>;
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
