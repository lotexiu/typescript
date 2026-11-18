import { PlainDate } from '@ts/plain/date/model';
import { DAYS_PER_WEEK } from '@ts/plain/declarations';
import type { TIsoWeekday } from '@ts/plain/types';
import { FIXED_WEEKS } from './declarations';
import type { TCalendarCell, TMonthGridOptions } from './types';

/** Lógica pura de calendário (sem DOM): a base de qualquer date-picker. Substitui o antigo `Time.calendarDays`. */
class CalendarUtils {
	/** Células de um mês (com os dias dos meses vizinhos que completam as semanas), em ordem de leitura. `month` é 1–12. */
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

export { CalendarUtils };
