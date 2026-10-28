import { describe, expect, it } from 'vitest';
import { PlainDate } from '@ts/plain/date/model';
import type { TDateAdd } from '@ts/plain/types';
import vectors from '../../../../vectors/plain.json';

describe('PlainDate — dias desde a época e dia da semana', () => {
	for (const v of vectors['epoch-days']) {
		it(`${v.date} ↔ ${v.days} (dia da semana ${v.weekday})`, () => {
			const date = PlainDate.parse(v.date);
			expect(date.toEpochDays()).toBe(v.days);
			expect(PlainDate.fromEpochDays(v.days).toString()).toBe(v.date);
			expect(date.dayOfWeek).toBe(v.weekday);
		});
	}

	it('ida e volta para uma faixa grande de dias', () => {
		for (let days = -719162; days <= 2932896; days += 977) expect(PlainDate.fromEpochDays(days).toEpochDays()).toBe(days);
	});

	it('dias consecutivos dão datas consecutivas válidas (1999-2001, inclusive o bissexto de 2000)', () => {
		let previous = PlainDate.parse('1999-12-30');
		for (let i = 0; i < 800; i++) {
			const next = previous.add({ days: 1 });
			expect(previous.daysUntil(next)).toBe(1);
			expect(PlainDate.isValid(next.year, next.month, next.day)).toBe(true);
			previous = next;
		}
		expect(PlainDate.parse('2000-02-29').inLeapYear).toBe(true);
		expect(PlainDate.parse('1900-02-28').add({ days: 1 }).toString()).toBe('1900-03-01');
	});
});

describe('PlainDate — validação (uma data inválida não existe)', () => {
	for (const text of vectors['invalid-dates']) {
		it(`recusa ${JSON.stringify(text)}`, () => {
			expect(PlainDate.tryParse(text)).toBeUndefined();
			expect(() => PlainDate.parse(text)).toThrow(RangeError);
		});
	}

	it('from lança com a causa; tryFrom devolve undefined', () => {
		expect(PlainDate.tryFrom({ year: 2025, month: 2, day: 29 })).toBeUndefined();
		expect(() => PlainDate.from({ year: 2025, month: 2, day: 29 })).toThrow(/inexistente/i);
		expect(PlainDate.tryFrom({ year: 2024, month: 2, day: 29 })?.toString()).toBe('2024-02-29');
	});

	it('não aceita fracionários nem não-números', () => {
		expect(PlainDate.isValid(2024, 1.5, 1)).toBe(false);
		expect(PlainDate.isValid(2024, 1, Number.NaN)).toBe(false);
	});
});

describe('PlainDate — soma de calendário', () => {
	for (const v of vectors.add) {
		it(`${v.date} + ${JSON.stringify(v.amount)} = ${v.result}${v.note ? ` (${v.note})` : ''}`, () => {
			expect(PlainDate.parse(v.date).add(v.amount as TDateAdd).toString()).toBe(v.result);
		});
	}

	it('subtract é o inverso nos casos sem "prender" o dia', () => {
		const date = PlainDate.parse('2026-05-15');
		expect(date.add({ months: 7, days: 3 }).subtract({ months: 7, days: 3 }).toString()).toBe('2026-05-15');
	});

	it('é imutável', () => {
		const date = PlainDate.parse('2026-05-15');
		date.add({ days: 10 });
		expect(date.toString()).toBe('2026-05-15');
	});

	it('dayOfYear, daysInMonth, daysInYear, with, equals, compare', () => {
		const date = PlainDate.parse('2024-12-31');
		expect(date.dayOfYear).toBe(366);
		expect(date.daysInYear).toBe(366);
		expect(PlainDate.parse('2023-12-31').dayOfYear).toBe(365);
		expect(PlainDate.parse('2024-02-10').daysInMonth).toBe(29);
		expect(date.with({ month: 2, day: 29 }).toString()).toBe('2024-02-29');
		expect(() => date.with({ month: 2 })).toThrow(RangeError);
		expect(date.equals(PlainDate.parse('2024-12-31'))).toBe(true);
		expect(PlainDate.compare(PlainDate.parse('2024-01-01'), date)).toBe(-1);
	});

	it('today usa o relógio injetado (campos locais)', () => {
		expect(PlainDate.today(() => new Date(2030, 5, 7, 23, 59)).toString()).toBe('2030-06-07');
	});
});

describe('limites do intervalo (anos 1–9999)', () => {
	it('fora do intervalo é recusado, sem estourar silenciosamente', () => {
		expect(() => PlainDate.fromEpochDays(-719163)).toThrow(RangeError);
		expect(() => PlainDate.fromEpochDays(2932897)).toThrow(RangeError);
		expect(() => PlainDate.parse('9999-12-31').add({ days: 1 })).toThrow(RangeError);
	});
});
