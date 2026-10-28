import type { TDurationUnit } from './types';

/** @internal */
const MS_PER_SECOND = 1000;
/** @internal */
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
/** @internal */
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
/** @internal */
const MS_PER_DAY = 24 * MS_PER_HOUR;

/** @internal */
const MIN_YEAR = 1;
/** @internal */
const MAX_YEAR = 9999;
/** @internal */
const MONTHS_PER_YEAR = 12;
/** @internal */
const DAYS_PER_WEEK = 7;
/** @internal */
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/** Dias entre 0000-03-01 e 1970-01-01 (deslocamento do algoritmo de dias-desde-época). */
/** @internal */
const EPOCH_SHIFT_DAYS = 719468;
/** @internal */
const DAYS_PER_ERA = 146097;
/** @internal */
const YEARS_PER_ERA = 400;
/** 1970-01-01 foi quinta-feira (ISO 4). */
/** @internal */
const EPOCH_ISO_WEEKDAY = 4;

/** @internal Mês 3 (março) é o início do ano nos cálculos de dias-desde-a-época. */
const MARCH = 3;
/** @internal */
const MONTHS_FROM_MARCH = 9;

/** @internal Quantos ms vale cada unidade fixa de `Duration`. */
const UNIT_MS: Readonly<Record<TDurationUnit, number>> = { days: MS_PER_DAY, hours: MS_PER_HOUR, minutes: MS_PER_MINUTE, seconds: MS_PER_SECOND, milliseconds: 1 };

/** @internal `2026-10-28` */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
/** @internal `08:30`, `08:30:15`, `08:30:15.250` */
const ISO_TIME = /^(\d{2}):(\d{2})(?::(\d{2})(?:[.,](\d{1,3}))?)?$/;
/** @internal `PT1H5M7.250S`, `P1DT2H`, `-PT5S` (ISO 8601). Pelo menos um componente. */
const ISO_DURATION = /^([+-])?P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)(?:[.,](\d{1,3}))?S)?)?$/;

export { MARCH, MONTHS_FROM_MARCH, UNIT_MS, ISO_DATE, ISO_TIME, ISO_DURATION, MS_PER_SECOND, MS_PER_MINUTE, MS_PER_HOUR, MS_PER_DAY, MIN_YEAR, MAX_YEAR, MONTHS_PER_YEAR, DAYS_PER_WEEK, DAYS_IN_MONTH, EPOCH_SHIFT_DAYS, DAYS_PER_ERA, YEARS_PER_ERA, EPOCH_ISO_WEEKDAY };
