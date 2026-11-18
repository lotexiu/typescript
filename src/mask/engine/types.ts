import type { TMaskPad } from '../types';

/** Só o que o motor de caracteres entende (o resto de `TMaskOptions` é do formatador). */
type TEngineOptions = Readonly<{ reversed?: boolean; pad?: TMaskPad }>;

export type { TEngineOptions };
