import { describe, expect, it } from 'vitest';
import { CalendarGrid } from '@ts/plain/calendar';
import { PlainDate } from '@ts/plain/date';
import { Duration } from '@ts/plain/duration';
import { PlainTime } from '@ts/plain/time';
import type { TDateAdd, TDurationParts, TIsoWeekday } from '@ts/plain/types';
import vectors from '../../../vectors/plain.json';

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

describe('Duration', () => {
	for (const v of vectors.duration) {
		it(`${JSON.stringify(v.parts)} ↔ ${v.iso}`, () => {
			const duration = Duration.from(v.parts as TDurationParts);
			expect(duration.toMilliseconds()).toBe(v.ms);
			expect(duration.toString()).toBe(v.iso);
			expect(Duration.parse(v.iso).toMilliseconds()).toBe(v.ms);
		});
	}

	for (const text of vectors['invalid-durations']) {
		it(`recusa ${JSON.stringify(text)}`, () => {
			expect(Duration.tryParse(text)).toBeUndefined();
			expect(() => Duration.parse(text)).toThrow(RangeError);
		});
	}

	it('componentes são do valor absoluto; o sinal vem à parte', () => {
		const d = Duration.from({ hours: -1, minutes: -5 });
		expect(d.sign).toBe(-1);
		expect([d.hours, d.minutes]).toEqual([1, 5]);
		expect(d.abs().toString()).toBe('PT1H5M');
	});

	it('total em qualquer unidade', () => {
		expect(Duration.from({ minutes: 90 }).total('hours')).toBe(1.5);
		expect(Duration.from('P1D').total('minutes')).toBe(1440);
	});

	it('soma, subtração, comparação e igualdade', () => {
		const a = Duration.from({ minutes: 50 });
		expect(a.add({ minutes: 20 }).toString()).toBe('PT1H10M');
		expect(a.subtract('PT1H').toString()).toBe('-PT10M');
		expect(Duration.compare(a, Duration.from('PT51M'))).toBe(-1);
		expect(a.equals(Duration.from({ seconds: 3000 }))).toBe(true);
	});

	it('rejeita não finitos', () => {
		expect(() => Duration.from({ hours: Number.NaN })).toThrow(RangeError);
		expect(() => Duration.fromMilliseconds(Infinity)).toThrow(RangeError);
	});

	it('serializa como ISO em JSON', () => {
		expect(JSON.stringify({ d: Duration.from({ minutes: 5 }) })).toBe('{"d":"PT5M"}');
	});
});

describe('PlainTime', () => {
	it('parse e toString', () => {
		expect(PlainTime.parse('09:05').toString()).toBe('09:05:00');
		expect(PlainTime.parse('23:59:59.5').toString()).toBe('23:59:59.5');
		expect(PlainTime.parse('00:00:00.250').millisecond).toBe(250);
	});

	it('recusa horas que não existem', () => {
		for (const text of ['24:00', '12:60', '12:30:60', '9:30', '12', '12:30:00.', 'ab:cd']) expect(PlainTime.tryParse(text)).toBeUndefined();
		expect(() => PlainTime.from({ hour: 25 })).toThrow(RangeError);
	});

	it('passar de 24h dá a volta (e voltar de 00:00 também)', () => {
		expect(PlainTime.parse('23:30').add({ hours: 1 }).toString()).toBe('00:30:00');
		expect(PlainTime.parse('00:10').subtract({ minutes: 20 }).toString()).toBe('23:50:00');
		expect(PlainTime.parse('12:00').add({ days: 3 }).toString()).toBe('12:00:00');
	});

	it('until não dá a volta e pode ser negativo', () => {
		expect(PlainTime.parse('09:00').until(PlainTime.parse('17:30')).toString()).toBe('PT8H30M');
		expect(PlainTime.parse('17:30').until(PlainTime.parse('09:00')).toString()).toBe('-PT8H30M');
	});

	it('fromMilliseconds e compare', () => {
		expect(PlainTime.fromMilliseconds(86_400_000 + 3_600_000).toString()).toBe('01:00:00');
		expect(PlainTime.compare(PlainTime.parse('08:00'), PlainTime.parse('08:00:00.001'))).toBe(-1);
	});
});

describe('CalendarGrid.month', () => {
	for (const v of vectors.grid) {
		it(`${v.year}-${String(v.month).padStart(2, '0')} semana começa em ${v.weekStart}, ${v.weeks}${v.note ? ` (${v.note})` : ''}`, () => {
			const cells = CalendarGrid.month(v.year, v.month, { weekStart: v.weekStart as TIsoWeekday, weeks: v.weeks as number | 'auto' });
			expect(cells).toHaveLength(v.cells);
			expect(cells[0].date.toString()).toBe(v.first);
			expect(cells.at(-1)!.date.toString()).toBe(v.last);
			expect(cells.filter((cell) => cell.inMonth)).toHaveLength(v.inMonth);
			expect(cells[0].date.dayOfWeek).toBe(v.weekStart);
		});
	}

	it('datas consecutivas, sem buracos nem repetição', () => {
		const cells = CalendarGrid.month(2026, 10);
		cells.slice(1).forEach((cell, index) => expect(cells[index].date.daysUntil(cell.date)).toBe(1));
	});

	it('weekdays na ordem do cabeçalho', () => {
		expect(CalendarGrid.weekdays()).toEqual([1, 2, 3, 4, 5, 6, 7]);
		expect(CalendarGrid.weekdays(7)).toEqual([7, 1, 2, 3, 4, 5, 6]);
	});

	it('inRange com limites opcionais', () => {
		const min = PlainDate.parse('2026-10-10');
		const max = PlainDate.parse('2026-10-20');
		expect(CalendarGrid.inRange(PlainDate.parse('2026-10-10'), min, max)).toBe(true);
		expect(CalendarGrid.inRange(PlainDate.parse('2026-10-21'), min, max)).toBe(false);
		expect(CalendarGrid.inRange(PlainDate.parse('2000-01-01'))).toBe(true);
	});
});

describe('limites do intervalo (anos 1–9999)', () => {
	it('fora do intervalo é recusado, sem estourar silenciosamente', () => {
		expect(() => PlainDate.fromEpochDays(-719163)).toThrow(RangeError);
		expect(() => PlainDate.fromEpochDays(2932897)).toThrow(RangeError);
		expect(() => PlainDate.parse('9999-12-31').add({ days: 1 })).toThrow(RangeError);
	});
});
