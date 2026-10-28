import { DAYS_PER_WEEK } from './declarations';
import { PlainDate } from './date';
import { TIsoWeekday } from './types';

type TCalendarCell = Readonly<{ date: PlainDate; inMonth: boolean }>;

type TMonthGridOptions = Readonly<{
	/** Primeiro dia da semana na grade: 1 = segunda (padrão, ISO) ... 7 = domingo. */
	weekStart?: TIsoWeekday;
	/** `6` (padrão): sempre 42 células, a grade não "pula" de altura entre meses. `'auto'`: só as semanas necessárias. */
	weeks?: number | 'auto';
}>;

const FIXED_WEEKS = 6;

/** Lógica pura de calendário (sem DOM): a base de qualquer date-picker. */
class CalendarGrid {
	/** Células de um mês (com os dias dos meses vizinhos que completam as semanas), em ordem de leitura. */
	static month(year: number, month: number, { weekStart = 1, weeks = FIXED_WEEKS }: TMonthGridOptions = {}): TCalendarCell[] {
		const first = PlainDate.from({ year, month, day: 1 });
		const lead = (first.dayOfWeek - weekStart + DAYS_PER_WEEK) % DAYS_PER_WEEK;
		const rows = weeks === 'auto' ? Math.ceil((lead + first.daysInMonth) / DAYS_PER_WEEK) : weeks;
		const start = first.toEpochDays() - lead;
		return Array.from({ length: rows * DAYS_PER_WEEK }, (_, index) => {
			const date = PlainDate.fromEpochDays(start + index);
			return { date, inMonth: date.month === month && date.year === year };
		});
	}

	/** Os dias da semana (ISO) na ordem em que o cabeçalho da grade os mostra. */
	static weekdays(weekStart: TIsoWeekday = 1): TIsoWeekday[] {
		return Array.from({ length: DAYS_PER_WEEK }, (_, index) => (((weekStart - 1 + index) % DAYS_PER_WEEK) + 1) as TIsoWeekday);
	}

	/** Dentro de `[min, max]` (limites opcionais, inclusivos)? */
	static inRange(date: PlainDate, min?: PlainDate, max?: PlainDate): boolean {
		return (!min || PlainDate.compare(date, min) >= 0) && (!max || PlainDate.compare(date, max) <= 0);
	}
}

export { CalendarGrid };
export type { TCalendarCell, TMonthGridOptions };
