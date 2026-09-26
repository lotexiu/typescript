import { TComputed } from '@ts/reactive-node/types';

type TFieldGet<S, V> = (source: S) => V;

type TFieldSet<S, V> = (source: S, value: V) => void;

// Um derived sobre parte de um signal, que também escreve de volta nele (no lugar + `notify`).
type TField<V> = TComputed<V> & {
	set(value: V): boolean;
	update(fn: (value: V) => V): boolean;
};

export type { TFieldGet, TFieldSet, TField };
