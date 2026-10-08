import { TInternal } from '@tsn-object/types';
import { Selection } from './model';
import { Signal } from '@ts/index';

type TSelection<K> = Selection<K> & TInternal<Signal<Set<K>>>;

export type { TSelection };
