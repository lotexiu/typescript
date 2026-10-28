import { Duration } from '../duration/model';
import { MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE, MS_PER_SECOND } from '../declarations';
import { TDurationParts, TTimeParts } from '../types';

const ISO_TIME = /^(\d{2}):(\d{2})(?::(\d{2})(?:[.,](\d{1,3}))?)?$/;
const pad = (value: number, size = 2) => String(value).padStart(size, '0');
const inRange = (value: number, max: number) => Number.isInteger(value) && value >= 0 && value <= max;

/** Hora do dia **sem data nem fuso**, imutável (`Temporal.PlainTime`). Passar de 24h dá a volta (23:30 + 1h = 00:30). */
class PlainTime {
	private constructor(
		readonly hour: number,
		readonly minute: number,
		readonly second: number,
		readonly millisecond: number
	) {}

	static isValid(hour: number, minute = 0, second = 0, millisecond = 0): boolean {
		return inRange(hour, 23) && inRange(minute, 59) && inRange(second, 59) && inRange(millisecond, 999);
	}

	static tryFrom({ hour, minute = 0, second = 0, millisecond = 0 }: TTimeParts): PlainTime | undefined {
		return PlainTime.isValid(hour, minute, second, millisecond) ? new PlainTime(hour, minute, second, millisecond) : undefined;
	}

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

	static compare(a: PlainTime, b: PlainTime): -1 | 0 | 1 {
		return Math.sign(a.toMilliseconds() - b.toMilliseconds()) as -1 | 0 | 1;
	}

	toMilliseconds(): number {
		return this.hour * MS_PER_HOUR + this.minute * MS_PER_MINUTE + this.second * MS_PER_SECOND + this.millisecond;
	}

	add(amount: TDurationParts | string | Duration): PlainTime {
		return PlainTime.fromMilliseconds(this.toMilliseconds() + Duration.from(amount).toMilliseconds());
	}

	subtract(amount: TDurationParts | string | Duration): PlainTime {
		return PlainTime.fromMilliseconds(this.toMilliseconds() - Duration.from(amount).toMilliseconds());
	}

	/** Diferença **sem dar a volta**: `09:00.until(17:30)` = 8h30; se `other` for antes, é negativa. */
	until(other: PlainTime): Duration {
		return Duration.fromMilliseconds(other.toMilliseconds() - this.toMilliseconds());
	}

	equals(other: PlainTime): boolean {
		return this.toMilliseconds() === other.toMilliseconds();
	}

	toString(): string {
		return `${pad(this.hour)}:${pad(this.minute)}:${pad(this.second)}${this.millisecond ? `.${pad(this.millisecond, 3).replace(/0+$/, '')}` : ''}`;
	}

	toJSON(): string {
		return this.toString();
	}
}

export { PlainTime };
