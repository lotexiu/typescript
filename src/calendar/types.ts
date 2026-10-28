import type { PlainDate } from '@ts/plain/date/model';
import type { TIsoWeekday } from '@ts/plain/types';

type TCalendarCell = Readonly<{ date: PlainDate; inMonth: boolean }>;

type TMonthGridOptions = Readonly<{
	/** Primeiro dia da semana na grade: 1 = segunda (padrão, ISO) ... 7 = domingo. */
	weekStart?: TIsoWeekday;
	/** `6` (padrão): sempre 42 células, a grade não "pula" de altura entre meses. `'auto'`: só as semanas necessárias. */
	weeks?: number | 'auto';
}>;

export type { TCalendarCell, TMonthGridOptions };
