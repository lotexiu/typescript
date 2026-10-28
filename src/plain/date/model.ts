import { DAYS_IN_MONTH, DAYS_PER_ERA, DAYS_PER_WEEK, EPOCH_ISO_WEEKDAY, EPOCH_SHIFT_DAYS, ISO_DATE, MARCH, MAX_YEAR, MIN_YEAR, MONTHS_FROM_MARCH, MONTHS_PER_YEAR, YEARS_PER_ERA } from '../declarations';
import { PlainUtils } from '../utils';
import { TDateAdd, TDateParts, TIsoWeekday } from '../types';



/**
 * Data de calendário **sem horário nem fuso**, imutável, no vocabulário do `Temporal.PlainDate`.
 * Validação de verdade (bissexto, dia por mês): uma data inválida **não existe** — `tryFrom` devolve `undefined`,
 * `from` lança `RangeError` com a causa. Anos de 1 a 9999.
 */
class PlainDate {
	private constructor(
		readonly year: number,
		readonly month: number,
		readonly day: number
	) {}

	static isValid(year: number, month: number, day: number): boolean {
		return PlainUtils.isInt(year) && PlainUtils.isInt(month) && PlainUtils.isInt(day) && year >= MIN_YEAR && year <= MAX_YEAR && month >= 1 && month <= MONTHS_PER_YEAR && day >= 1 && day <= PlainUtils.daysInMonth(year, month);
	}

	static tryFrom({ year, month, day }: TDateParts): PlainDate | undefined {
		return PlainDate.isValid(year, month, day) ? new PlainDate(year, month, day) : undefined;
	}

	static from(parts: TDateParts | string): PlainDate {
		if (typeof parts === 'string') return PlainDate.parse(parts);
		const date = PlainDate.tryFrom(parts);
		if (!date) throw new RangeError(`Data inexistente: ${parts.year}-${parts.month}-${parts.day}`);
		return date;
	}

	/** `YYYY-MM-DD`. */
	static tryParse(text: string): PlainDate | undefined {
		const match = ISO_DATE.exec(text.trim());
		return match ? PlainDate.tryFrom({ year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }) : undefined;
	}

	static parse(text: string): PlainDate {
		const date = PlainDate.tryParse(text);
		if (!date) throw new RangeError(`Data ISO 8601 inválida ou inexistente: "${text}"`);
		return date;
	}

	/** Campos **locais** de um `Date` (mesmo que o usuário vê no relógio dele). */
	static fromDate(date: Date): PlainDate {
		return PlainDate.from({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
	}

	/** O relógio é injetável (testes, outros fusos): `PlainDate.today(() => new Date(...))`. */
	static today(now: () => Date = () => new Date()): PlainDate {
		return PlainDate.fromDate(now());
	}

	/** Dias desde 1970-01-01 (negativos antes). Algoritmo "civil from days" de H. Hinnant. */
	static fromEpochDays(days: number): PlainDate {
		const shifted = days + EPOCH_SHIFT_DAYS;
		const era = Math.floor(shifted / DAYS_PER_ERA);
		const dayOfEra = shifted - era * DAYS_PER_ERA;
		const yearOfEra = Math.floor((dayOfEra - Math.floor(dayOfEra / 1460) + Math.floor(dayOfEra / 36524) - Math.floor(dayOfEra / 146096)) / 365);
		const dayOfYear = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
		const monthIndex = Math.floor((5 * dayOfYear + 2) / 153);
		const day = dayOfYear - Math.floor((153 * monthIndex + 2) / 5) + 1;
		const month = monthIndex < 10 ? monthIndex + MARCH : monthIndex - MONTHS_FROM_MARCH;
		return PlainDate.from({ year: yearOfEra + era * YEARS_PER_ERA + (month <= 2 ? 1 : 0), month, day });
	}

	static compare(a: PlainDate, b: PlainDate): -1 | 0 | 1 {
		return Math.sign(a.toEpochDays() - b.toEpochDays()) as -1 | 0 | 1;
	}

	toEpochDays(): number {
		const year = this.month <= 2 ? this.year - 1 : this.year;
		const era = Math.floor(year / YEARS_PER_ERA);
		const yearOfEra = year - era * YEARS_PER_ERA;
		const monthIndex = this.month > 2 ? this.month - MARCH : this.month + MONTHS_FROM_MARCH;
		const dayOfYear = Math.floor((153 * monthIndex + 2) / 5) + this.day - 1;
		const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;
		return era * DAYS_PER_ERA + dayOfEra - EPOCH_SHIFT_DAYS;
	}

	get inLeapYear(): boolean {
		return PlainUtils.isLeap(this.year);
	}

	get daysInMonth(): number {
		return PlainUtils.daysInMonth(this.year, this.month);
	}

	get daysInYear(): number {
		return this.inLeapYear ? 366 : 365;
	}

	get dayOfYear(): number {
		return this.toEpochDays() - new PlainDate(this.year, 1, 1).toEpochDays() + 1;
	}

	/** 1 = segunda ... 7 = domingo. */
	get dayOfWeek(): TIsoWeekday {
		return ((((this.toEpochDays() + EPOCH_ISO_WEEKDAY - 1) % DAYS_PER_WEEK) + DAYS_PER_WEEK) % DAYS_PER_WEEK) + 1 as TIsoWeekday;
	}

	/** Anos/meses primeiro (o dia é "preso" ao último dia do mês), depois semanas/dias. */
	add({ years = 0, months = 0, weeks = 0, days = 0 }: TDateAdd): PlainDate {
		const totalMonths = this.year * MONTHS_PER_YEAR + (this.month - 1) + years * MONTHS_PER_YEAR + months;
		const year = Math.floor(totalMonths / MONTHS_PER_YEAR);
		const month = (totalMonths % MONTHS_PER_YEAR + MONTHS_PER_YEAR) % MONTHS_PER_YEAR + 1;
		const moved = PlainDate.from({ year, month, day: Math.min(this.day, PlainUtils.daysInMonth(year, month)) });
		return weeks || days ? PlainDate.fromEpochDays(moved.toEpochDays() + weeks * DAYS_PER_WEEK + days) : moved;
	}

	subtract(amount: TDateAdd): PlainDate {
		return this.add({ years: -(amount.years ?? 0), months: -(amount.months ?? 0), weeks: -(amount.weeks ?? 0), days: -(amount.days ?? 0) });
	}

	/** Quantos dias até `other` (negativo se `other` for anterior). */
	daysUntil(other: PlainDate): number {
		return other.toEpochDays() - this.toEpochDays();
	}

	with(parts: Partial<TDateParts>): PlainDate {
		return PlainDate.from({ year: this.year, month: this.month, day: this.day, ...parts });
	}

	equals(other: PlainDate): boolean {
		return this.year === other.year && this.month === other.month && this.day === other.day;
	}

	toString(): string {
		return `${String(this.year).padStart(4, '0')}-${String(this.month).padStart(2, '0')}-${String(this.day).padStart(2, '0')}`;
	}

	toJSON(): string {
		return this.toString();
	}
}

export { PlainDate };
