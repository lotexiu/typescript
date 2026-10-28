import { MaskEngine } from './engine/model';
import type { TEngineOptions } from './engine/types';
import { MASK_PRESETS } from './declarations';
import type { PlainDate } from '@ts/plain/date/model';
import { MaskDateUtils } from './date/utils';
import type { TMaskDateConfig } from './date/types';
import { MaskFormatter } from './formatter/model';
import { TMaskDefinition, TMaskNumber, TMaskRule } from './types';

/**
 * Porta única de formatação por máscara. A API estática antiga (`apply/unapply/valid`, regras globais) continua igual
 * e usa uma instância padrão; para algo mais rico use `Mask.of(...)`:
 *
 * ```ts
 * Mask.of('duration-clock').format(1_936_000)            // "32:16"
 * Mask.of('duration-clock').parse('1:05:07').typed       // 3_907_000 (ms)
 * Mask.of({ number: { scale: 2, decimal: ',', group: '.' } }).apply('1234567') // "12.345,67"
 * Mask.of({ pattern: 'NN-NN', rules: { N: { match: ['[A-Z0-9]'] } } })         // regra só desta máscara
 * ```
 */
class Mask {
	static readonly #default = new MaskEngine();
	static readonly #presets = new Map<string, TMaskDefinition>(Object.entries(MASK_PRESETS));

	static readonly rules = Mask.#default.rules;
	static readonly ruleKeys = Mask.#default.ruleKeys;
	static readonly ruleMatcher = Mask.#default.ruleMatcher;

	static resetRulesToDefault() {
		Mask.#default.resetRulesToDefault();
	}

	static clearRules() {
		Mask.#default.clearRules();
	}

	static setRule(key: string, rule: TMaskRule) {
		Mask.#default.setRule(key, rule);
	}

	static apply(value: string, mask: string, options?: TEngineOptions) {
		return Mask.#default.apply(value, mask, options);
	}

	static unapply(value: string, mask: string, options?: TEngineOptions) {
		return Mask.#default.unapply(value, mask, options);
	}

	static valid(value: string, mask: string): boolean {
		return Mask.#default.valid(value, mask);
	}

	static validWithoutMask(value: string, mask: string): boolean {
		return Mask.#default.validWithoutMask(value, mask);
	}

	/** Registra (ou substitui) um preset — só dados. É assim que pacotes de região/domínio trazem os seus. */
	static preset(id: string, definition: TMaskDefinition): void {
		Mask.#presets.set(id, definition);
	}

	static hasPreset(id: string): boolean {
		return Mask.#presets.has(id);
	}

	/** Uma máscara pronta: id de um preset, um padrão (`'000.000'`) ou uma definição completa. */
	static of<T = string>(spec: string | TMaskDefinition): MaskFormatter<T> {
		const definition: TMaskDefinition = typeof spec === 'string' ? (Mask.#presets.get(spec) ?? { pattern: spec }) : spec;
		const engine = definition.rules ? new MaskEngine(definition.rules, Mask.#default) : Mask.#default;
		return new MaskFormatter<T>(engine, definition);
	}

	/** Data digitada só com números, com **calendário validado**; ordem e separador são parâmetros. Tipado = `PlainDate`. */
	static date(config: TMaskDateConfig): MaskFormatter<PlainDate> {
		return Mask.of<PlainDate>(MaskDateUtils.definition(config));
	}

	/** Atalho para números "da direita" (valor monetário, quantidade...): separadores e casas são parâmetros. */
	static number(config: TMaskNumber): MaskFormatter<number> {
		return Mask.of<number>({ number: config });
	}
}

export { Mask };
