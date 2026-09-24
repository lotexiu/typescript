import { TDerived } from '@ts/signal/types';

type TFieldGet<S, V> = (source: S) => V;

type TFieldSet<S, V> = (source: S, value: V) => void;

// Um derived sobre parte de um signal, que também escreve de volta nele (no lugar + `notify`).
type TField<V> = TDerived<V> & {
	set(value: V): boolean;
	update(fn: (value: V) => V): boolean;
};

export type { TFieldGet, TFieldSet, TField };
