/** Unidades fixas de tempo (sem meses/anos: eles dependem do calendário e ficam em `PlainDate`). */
type TDurationUnit = 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds';

/** Amounts per unit, for building or adding durations. */
type TDurationParts = Partial<Record<TDurationUnit, number>>;

/** A calendar date: year, month (1–12) and day. */
type TDateParts = Readonly<{ year: number; month: number; day: number }>;

/** Soma de calendário: meses/anos "prendem" o dia ao último dia do mês (31/jan + 1 mês = 28 ou 29/fev). */
type TDateAdd = Partial<Record<'years' | 'months' | 'weeks' | 'days', number>>;

/** A time of day; missing parts are 0. */
type TTimeParts = Readonly<{ hour: number; minute?: number; second?: number; millisecond?: number }>;

/** 1 = segunda ... 7 = domingo (ISO 8601, como o Temporal). */
type TIsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type { TDurationUnit, TDurationParts, TDateParts, TDateAdd, TTimeParts, TIsoWeekday };
