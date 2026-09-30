import { TInternal } from '@tsn-object/types';
import { Selection } from './model';

type TSelectionMode = 'single' | 'multi';

type TSelection<K> = Selection<K> & TInternal<{ mode: TSelectionMode }>;

export type { TSelectionMode, TSelection };
