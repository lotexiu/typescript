import type { TDateOrder } from './types';

/** @internal */
const YEAR_DIGITS = 4;
/** @internal */
const PAIR = 2;
/** @internal Dígitos digitados numa data completa (aaaammdd). */
const TOTAL_DIGITS = YEAR_DIGITS + PAIR * 2;

/** @internal Onde cada campo fica nos 8 dígitos digitados. */
const LAYOUT: Readonly<Record<TDateOrder, Readonly<Record<'year' | 'month' | 'day', readonly [number, number]>>>> = {
	ymd: { year: [0, 4], month: [4, 6], day: [6, 8] },
	dmy: { day: [0, 2], month: [2, 4], year: [4, 8] },
	mdy: { month: [0, 2], day: [2, 4], year: [4, 8] },
};

export { YEAR_DIGITS, PAIR, TOTAL_DIGITS, LAYOUT };
