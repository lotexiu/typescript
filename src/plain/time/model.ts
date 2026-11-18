import { RegexUtils } from '@tsn/regex/utils';
import { Duration } from '../duration/model';
import { ISO_TIME, MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE, MS_PER_SECOND } from '../declarations';
import { PlainUtils } from '../utils';
import { TDurationParts, TTimeParts } from '../types';


/** Hora do dia **sem data nem fuso**, imutável (`Temporal.PlainTime`). Passar de 24h dá a volta (23:30 + 1h = 00:30). */
class PlainTime {
	private constructor(
		readonly hour: number,
		readonly minute: number,
		readonly second: number,
		readonly millisecond: number
	) {}

	/** Whether the parts form a valid time of day. */
	static isValid(hour: number, minute = 0, second = 0, millisecond = 0): boolean {
		return PlainUtils.inRange(hour, 23) && PlainUtils.inRange(minute, 59) && PlainUtils.inRange(second, 59) && PlainUtils.inRange(millisecond, 999);
	}

	/** The time, or `undefined` when invalid. */
	static tryFrom({ hour, minute = 0, second = 0, millisecond = 0 }: TTimeParts): PlainTime | undefined {
		return PlainTime.isValid(hour, minute, second, millisecond) ? new PlainTime(hour, minute, second, millisecond) : undefined;
	}

	/** The time from parts or ISO text; throws `RangeError` when invalid. */
	static from(parts: TTimeParts | string): PlainTime {
		if (typeof parts === 'string') return PlainTime.parse(parts);
		const time = PlainTime.tryFrom(parts);
		if (!time) throw new RangeError(`Hora inexistente: ${parts.hour}:${parts.minute ?? 0}:${parts.second ?? 0}.${parts.millisecond ?? 0}`);
		return time;
	}

	/** `HH:mm`, `HH:mm:ss` ou `HH:mm:ss.SSS`. */
	static tryParse(text: string): PlainTime | undefined {
		const match = ISO_TIME.exec(text.trim());
		if (!match) return undefined;
		const [, hour, minute, second = '0', fraction = ''] = match;
		return PlainTime.tryFrom({ hour: Number(hour), minute: Number(minute), second: Number(second), millisecond: Number(fraction.padEnd(3, '0') || 0) });
	}

	/** Reads `HH:mm`, `HH:mm:ss` or `HH:mm:ss.sss`; throws `RangeError` otherwise. */
	static parse(text: string): PlainTime {
		const time = PlainTime.tryParse(text);
		if (!time) throw new RangeError(`Hora ISO 8601 inválida: "${text}"`);
		return time;
	}

	/** Milissegundos desde 00:00; valores fora de um dia dão a volta. */
	static fromMilliseconds(ms: number): PlainTime {
		const day = ((Math.trunc(ms) % MS_PER_DAY) + MS_PER_DAY) % MS_PER_DAY;
		return new PlainTime(Math.floor(day / MS_PER_HOUR), Math.floor((day % MS_PER_HOUR) / MS_PER_MINUTE), Math.floor((day % MS_PER_MINUTE) / MS_PER_SECOND), day % MS_PER_SECOND);
	}

	/** -1, 0 or 1, like a sort comparator. */
	static compare(left: PlainTime, right: PlainTime): -1 | 0 | 1 {
		return Math.sign(left.toMilliseconds() - right.toMilliseconds()) as -1 | 0 | 1;
	}

	/** Milliseconds since midnight. */
	toMilliseconds(): number {
		return this.hour * MS_PER_HOUR + this.minute * MS_PER_MINUTE + this.second * MS_PER_SECOND + this.millisecond;
	}

	/** The time moved forward, wrapping around midnight. */
	add(amount: TDurationParts | string | Duration): PlainTime {
		return PlainTime.fromMilliseconds(this.toMilliseconds() + Duration.from(amount).toMilliseconds());
	}

	/** The time moved back, wrapping around midnight. */
	subtract(amount: TDurationParts | string | Duration): PlainTime {
		return PlainTime.fromMilliseconds(this.toMilliseconds() - Duration.from(amount).toMilliseconds());
	}

	/** Diferença **sem dar a volta**: `09:00.until(17:30)` = 8h30; se `other` for antes, é negativa. */
	until(other: PlainTime): Duration {
		return Duration.fromMilliseconds(other.toMilliseconds() - this.toMilliseconds());
	}

	/** Same time. */
	equals(other: PlainTime): boolean {
		return this.toMilliseconds() === other.toMilliseconds();
	}

	/** ISO text (`HH:mm:ss`, with milliseconds when present). */
	toString(): string {
		return `${PlainUtils.pad(this.hour)}:${PlainUtils.pad(this.minute)}:${PlainUtils.pad(this.second)}${this.millisecond ? `.${RegexUtils.trimTrailingZeros(PlainUtils.pad(this.millisecond, 3))}` : ''}`;
	}

	/** Same as `toString`. */
	toJSON(): string {
		return this.toString();
	}
}

export { PlainTime };
