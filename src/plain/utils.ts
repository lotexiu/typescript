import { DAYS_IN_MONTH } from './declarations';

/** Auxiliares puros compartilhados por `PlainDate`, `PlainTime` e `Duration`. */
class PlainUtils {
	static isLeap(year: number): boolean {
		return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	}

	/** Dias do mês (`month` 1–12) no ano dado. */
	static daysInMonth(year: number, month: number): number {
		return month === 2 && PlainUtils.isLeap(year) ? 29 : DAYS_IN_MONTH[month - 1];
	}

	static isInt(value: unknown): value is number {
		return typeof value === 'number' && Number.isInteger(value);
	}

	/** Inteiro em `[0, max]`. */
	static inRange(value: number, max: number): boolean {
		return Number.isInteger(value) && value >= 0 && value <= max;
	}

	static pad(value: number, size = 2): string {
		return String(value).padStart(size, '0');
	}
}

export { PlainUtils };
