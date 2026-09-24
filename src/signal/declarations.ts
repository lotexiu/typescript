import { TLocaleMap } from '@ts/locale/types';

/**
 * @internal
 * Bits de `ReactiveNode.#flags` — um inteiro no lugar de cinco booleanos (nó menor e mais barato de criar).
 */
const NODE_FLAGS = {
	// Um consumidor vivo recebeu push de mudança e ainda não conferiu.
	DIRTY: 1,
	// Precisa calcular sem conferir as dependências: nunca calculou, ou o último cálculo lançou erro.
	MUST_RECOMPUTE: 2,
	// Já tem um valor válido para comparar com `equal`.
	HAS_VALUE: 4,
	// O `compute` está rodando agora — ler a si mesmo neste estado é ciclo.
	COMPUTING: 8,
	// Já está na fila de notificação dos listeners.
	QUEUED: 16,
} as const;

const SIGNAL_LOCALES = {
	'en-US': {
		cycle: 'Cycle detected: a derived read itself while computing.',
		writeInDerived:
			'Writing to a signal while a derived is computing is not allowed — derived values must not have side effects. Use subscribe() for side effects.',
	},
	'pt-BR': {
		cycle: 'Ciclo detectado: um derived leu a si mesmo durante o cálculo.',
		writeInDerived:
			'Escrever num signal durante o cálculo de um derived não é permitido — derived não deve ter efeito colateral. Use subscribe() para efeitos colaterais.',
	},
} as const satisfies TLocaleMap;

export { NODE_FLAGS, SIGNAL_LOCALES };
