import { TInternal } from '@tsn-object/types';
import { Selection } from './model';
import { Signal } from '@ts/index';

type TSelectionMode = 'single' | 'multi';

type TSelection<K> = Selection<K> & TInternal<Signal<Set<K>>>;

export type { TSelectionMode, TSelection };
