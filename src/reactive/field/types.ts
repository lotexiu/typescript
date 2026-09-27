import { TInternal } from '@tsn-object/types';
import { Signal } from '@tsr-node/signal/model';
import { Field } from './model';

type TFieldGet<S, V> = (source: S) => V;

type TFieldSet<S, V> = (source: S, value: V) => void;

type TField<S, V> = Field<V> &
	TInternal<{
		source: Signal<S>;
		getter: TFieldGet<S, V>;
		setter: TFieldSet<S, V>;
	}>;

export type { TFieldGet, TFieldSet, TField };
