/**
 * @internal
*/
class _Number {
	/** Converte texto bruto em number, ou undefined se vazio/não numérico. Não julga validade de negócio. */
	static parse(raw: string): number | undefined {
		if (raw.trim() === "") return undefined;
		const parsed = Number(raw);
		return Number.isNaN(parsed) ? undefined : parsed;
	}
}

/** Converte texto bruto em number, ou undefined se vazio/não numérico. Não julga validade de negócio. */
const parse = _Number.parse;

export {
	_Number,
	parse,
}
