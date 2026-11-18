import { RegexUtils } from '@tsn/regex/utils';
import { ISO_DURATION, MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE, MS_PER_SECOND, UNIT_MS } from '../declarations';
import { TDurationParts, TDurationUnit } from '../types';

/**
 * Duração imutável, em milissegundos inteiros, no vocabulário do Temporal (`Temporal.Duration`).
 * Só unidades fixas (dias, horas, minutos, segundos, ms): "1 mês" não é uma duração fixa — use `PlainDate.add`.
 * Os componentes (`hours`, `minutes`...) são do **valor absoluto**; o sinal vem em `sign`.
 */
class Duration {
	/** A duration of zero. */
	static readonly zero = new Duration(0);

	readonly #ms: number;

	private constructor(ms: number) {
		this.#ms = ms;
	}

	/** A duration of `ms` milliseconds. */
	static fromMilliseconds(ms: number): Duration {
		if (!Number.isFinite(ms)) throw new RangeError(`Duração inválida: ${ms}`);
		return ms === 0 ? Duration.zero : new Duration(Math.trunc(ms));
	}

	/** `Duration.from({ hours: 1, minutes: 30 })` ou `Duration.from('PT1H30M')`. */
	static from(source: TDurationParts | string | Duration): Duration {
		if (source instanceof Duration) return source;
		if (typeof source === 'string') return Duration.parse(source);
		let total = 0;
		for (const [unit, value] of Object.entries(source) as [TDurationUnit, number | undefined][]) {
			if (value === undefined) continue;
			if (!(unit in UNIT_MS) || !Number.isFinite(value)) throw new RangeError(`Componente inválido: ${unit}=${value}`);
			total += value * UNIT_MS[unit];
		}
		return Duration.fromMilliseconds(total);
	}

	/** Reads ISO 8601 text (`PT1H30M`), or `undefined`. */
	static tryParse(text: string): Duration | undefined {
		const match = ISO_DURATION.exec(text.trim());
		if (!match || match.slice(2, 7).every((part) => part === undefined)) return undefined;
		const [, sign, days = '0', hours = '0', minutes = '0', seconds = '0', fraction = ''] = match;
		const ms = Number(days) * MS_PER_DAY + Number(hours) * MS_PER_HOUR + Number(minutes) * MS_PER_MINUTE + Number(seconds) * MS_PER_SECOND + Number(fraction.padEnd(3, '0') || 0);
		return Duration.fromMilliseconds(sign === '-' ? -ms : ms);
	}

	/** Reads ISO 8601 text; throws `RangeError` for anything else. */
	static parse(text: string): Duration {
		const parsed = Duration.tryParse(text);
		if (!parsed) throw new RangeError(`Duração ISO 8601 inválida: "${text}"`);
		return parsed;
	}

	/** -1, 0 ou 1. */
	static compare(left: Duration, right: Duration): -1 | 0 | 1 {
		return Math.sign(left.#ms - right.#ms) as -1 | 0 | 1;
	}

	/** -1, 0 or 1. */
	get sign(): -1 | 0 | 1 {
		return Math.sign(this.#ms) as -1 | 0 | 1;
	}

	/** Whether it is zero. */
	get blank(): boolean {
		return this.#ms === 0;
	}

	/** Whole days. */
	get days(): number {
		return Math.floor(Math.abs(this.#ms) / MS_PER_DAY);
	}

	/** Hours left after the days (0–23). */
	get hours(): number {
		return Math.floor((Math.abs(this.#ms) % MS_PER_DAY) / MS_PER_HOUR);
	}

	/** Minutes left after the hours (0–59). */
	get minutes(): number {
		return Math.floor((Math.abs(this.#ms) % MS_PER_HOUR) / MS_PER_MINUTE);
	}

	/** Seconds left after the minutes (0–59). */
	get seconds(): number {
		return Math.floor((Math.abs(this.#ms) % MS_PER_MINUTE) / MS_PER_SECOND);
	}

	/** Milliseconds left after the seconds (0–999). */
	get milliseconds(): number {
		return Math.abs(this.#ms) % MS_PER_SECOND;
	}

	/** Total em uma unidade (pode ser fracionário): `Duration.from({ minutes: 90 }).total('hours') === 1.5`. */
	total(unit: TDurationUnit): number {
		return this.#ms / UNIT_MS[unit];
	}

	/** Total length in milliseconds. */
	toMilliseconds(): number {
		return this.#ms;
	}

	/** Sum with another duration. */
	add(other: TDurationParts | string | Duration): Duration {
		return Duration.fromMilliseconds(this.#ms + Duration.from(other).#ms);
	}

	/** Difference with another duration. */
	subtract(other: TDurationParts | string | Duration): Duration {
		return Duration.fromMilliseconds(this.#ms - Duration.from(other).#ms);
	}

	/** Opposite sign. */
	negated(): Duration {
		return Duration.fromMilliseconds(-this.#ms);
	}

	/** Without sign. */
	abs(): Duration {
		return this.sign < 0 ? this.negated() : this;
	}

	/** Same length. */
	equals(other: Duration): boolean {
		return this.#ms === other.#ms;
	}

	/** ISO 8601 text (`PT1H30M`). */
	toString(): string {
		if (this.blank) return 'PT0S';
		const time = [this.hours && `${this.hours}H`, this.minutes && `${this.minutes}M`, (this.seconds || this.milliseconds) && `${this.seconds}${this.milliseconds ? `.${RegexUtils.trimTrailingZeros(String(this.milliseconds).padStart(3, '0'))}` : ''}S`].filter(Boolean).join('');
		return `${this.sign < 0 ? '-' : ''}P${this.days ? `${this.days}D` : ''}${time ? `T${time}` : ''}`;
	}

	/** Same as `toString`. */
	toJSON(): string {
		return this.toString();
	}
}

export { Duration };
