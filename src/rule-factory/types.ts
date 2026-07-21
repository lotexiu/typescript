/** What a slot's `derive`/`suggest` function receives: the factory's seeds, and `get()` to read an earlier-declared slot's resolved value. */
type TRuleContext<TSeeds, TSlots> = {
	seeds: TSeeds;
	/** Lê outro slot pelo nome — só enxerga slots já declarados (e resolvidos) antes deste. */
	get: <K extends keyof TSlots>(slot: K) => TSlots[K];
};

/** One slot's rule: how to compute its value, and optionally how to suggest a better one without forcing it. */
type TSlotRule<TSeeds, TSlots, K extends keyof TSlots> = {
	/** Calcula o valor do slot a partir das seeds e/ou de outros slots. */
	derive: (context: TRuleContext<TSeeds, TSlots>) => TSlots[K];
	/**
	 * Sugestão opcional de um valor melhor pra este slot. Nunca substitui o
	 * valor calculado por `derive` — só fica disponível à parte, em
	 * `suggestions`, pra quem quiser aplicar. Retorne `undefined` (ou o
	 * próprio `value`) quando não houver sugestão melhor.
	 */
	suggest?: (value: TSlots[K], context: TRuleContext<TSeeds, TSlots>) => TSlots[K] | undefined;
};

/** The full rule map `createFactory` takes — one `TSlotRule` per slot, resolved in declaration order. */
type TFactoryRules<TSeeds, TSlots> = {
	[K in keyof TSlots]: TSlotRule<TSeeds, TSlots, K>;
};

/** What `build(seeds)` returns: every slot's derived `values`, plus any `suggestions` a slot's `suggest` actually offered. */
type TFactoryResult<TSlots> = {
	values: TSlots;
	suggestions: Partial<TSlots>;
};

export type {
	TRuleContext,
	TSlotRule,
	TFactoryRules,
	TFactoryResult,
}
