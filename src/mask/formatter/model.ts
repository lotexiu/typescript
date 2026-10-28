import { MaskCheckUtils } from '../checks/utils';
import { MASK_CODECS } from '../declarations';
import { MaskEngine } from '../engine/model';
import { MaskNumberUtils } from '../number/utils';
import { TMaskCheckResult, TMaskCodec, TMaskDefinition, TMaskParsed } from '../types';

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
		if (number) return MaskNumberUtils.format(MaskNumberUtils.digits(text), number);
		return this.engine.apply(text, this.pattern, { reversed, pad });
	}

	unapply(text: string): string {
		const { number, reversed } = this.definition;
		if (number) return MaskNumberUtils.digits(text);
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
		const reason = MaskCheckUtils.run(this.unapply(text), this.definition.checks);
		return reason ? { ok: false, reason } : OK;
	}

	parse(text: string): TMaskParsed<T> {
		const unmasked = this.unapply(text);
		const typed = this.definition.number ? (MaskNumberUtils.toTyped(unmasked, this.definition.number.scale) as T | undefined) : this.#codec.parse(unmasked);
		return { masked: this.apply(unmasked), unmasked, typed, check: this.check(this.apply(unmasked)) };
	}

	/** Valor tipado → texto mascarado (`''` se o valor não é representável). */
	format(typed: T): string {
		const { number } = this.definition;
		const unmasked = number ? MaskNumberUtils.fromTyped(typed as number, number.scale) : this.#codec.format(typed);
		return unmasked === undefined ? '' : this.apply(unmasked);
	}
	/**
	 * Onde fica o cursor depois de reformatar. `typedText`/`typedCaret`: o texto como o navegador o deixou e a posição do cursor nele;
	 * `nextText`: o resultado de `apply(typedText)` (calculado aqui se omitido). O cursor acompanha o **dado**, não a posição:
	 * pula literais inseridos pela máscara e, em máscaras da direita para a esquerda, conta a partir do fim.
	 */
	caret(typedText: string, typedCaret: number, nextText: string = this.apply(typedText)): number {
		const caret = Math.max(0, Math.min(typedCaret, typedText.length));
		if (this.definition.number || this.definition.reversed) {
			const after = this.unapply(typedText.slice(caret)).length;
			for (let index = nextText.length; index > 0; index--) if (this.unapply(nextText.slice(index)).length >= after) return index;
			return 0;
		}
		const before = this.unapply(typedText.slice(0, caret)).length;
		if (before === 0) return 0;
		for (let index = 1; index <= nextText.length; index++) if (this.unapply(nextText.slice(0, index)).length >= before) return index;
		return nextText.length;
	}
}

export { MaskFormatter };
