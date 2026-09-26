import { TLocaleMap } from '@ts/locale/types';

/**
 * @internal
 */
const NODE = Symbol('node');

/**
 * @internal
 */
const NODE_FLAGS = {
	DIRTY: 1,
	MUST_RECOMPUTE: 2,
	HAS_VALUE: 4,
	COMPUTING: 8,
	QUEUED: 16,
} as const;

const SIGNAL_LOCALES = {
	'en-US': {
		cycle: 'Cycle detected: a computed read itself while computing.',
		writeInComputed:
			'Writing to a signal while a computed is computing is not allowed — computed values must not have side effects. Use subscribe() for side effects.',
	},
	'pt-BR': {
		cycle: 'Ciclo detectado: um computed leu a si mesmo durante o cálculo.',
		writeInComputed:
			'Escrever num signal durante o cálculo de um computed não é permitido — computed não deve ter efeito colateral. Use subscribe() para efeitos colaterais.',
	},
} as const satisfies TLocaleMap;

export { NODE, NODE_FLAGS, SIGNAL_LOCALES };
