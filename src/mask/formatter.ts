import { MaskChecks } from './checks';
import { MASK_CODECS } from './codecs';
import { MaskEngine } from './engine';
import { MaskNumber } from './number';
import { TMaskCheckResult, TMaskCodec, TMaskDefinition, TMaskParsed } from './types';

const OK: TMaskCheckResult = { ok: true };

/**
 * Uma máscara pronta para uso: padrão + opções, com os **três valores** do mesmo dado:
 * `masked` (o que se mostra), `unmasked` (só o que o usuário digitou) e `typed` (número, ms, ... via codec).
 */
class MaskFormatter<T = string> {
	readonly #codec: TMaskCodec<T>;

	constructor(
		readonly engine: MaskEngine,
		readonly definition: TMaskDefinition
	) {
		const codec = definition.codec ?? 'text';
		this.#codec = (typeof codec === 'string' ? MASK_CODECS[codec] : codec) as TMaskCodec<T>;
	}

	get pattern(): string {
		return this.definition.pattern ?? '';
	}

	apply(text: string): string {
		const { number, reversed, pad } = this.definition;
		if (number) return MaskNumber.format(MaskNumber.digits(text), number);
		return this.engine.apply(text, this.pattern, { reversed, pad });
	}

	unapply(text: string): string {
		const { number, reversed } = this.definition;
		if (number) return MaskNumber.digits(text);
		return this.engine.unapply(text, this.pattern, { reversed });
	}

	/** O texto está completo e na forma exata da máscara? (Não olha as `checks`.) */
	valid(text: string): boolean {
		const { number, reversed } = this.definition;
		if (number || reversed) {
			const unmasked = this.unapply(text);
			return unmasked !== '' && this.apply(unmasked) === text;
		}
		return this.engine.valid(text, this.pattern);
	}

	/** Forma + checagens (faixa, enum, tamanho, dígito verificador). Devolve o **motivo**, nunca lança. */
	check(text: string): TMaskCheckResult {
		if (!this.valid(text)) return { ok: false, reason: 'pattern' };
		const reason = MaskChecks.run(this.unapply(text), this.definition.checks);
		return reason ? { ok: false, reason } : OK;
	}

	parse(text: string): TMaskParsed<T> {
		const unmasked = this.unapply(text);
		const typed = this.definition.number ? (MaskNumber.toTyped(unmasked, this.definition.number.scale) as T | undefined) : this.#codec.parse(unmasked);
		return { masked: this.apply(unmasked), unmasked, typed, check: this.check(this.apply(unmasked)) };
	}

	/** Valor tipado → texto mascarado (`''` se o valor não é representável). */
	format(typed: T): string {
		const { number } = this.definition;
		const unmasked = number ? MaskNumber.fromTyped(typed as number, number.scale) : this.#codec.format(typed);
		return unmasked === undefined ? '' : this.apply(unmasked);
	}
}

export { MaskFormatter };
