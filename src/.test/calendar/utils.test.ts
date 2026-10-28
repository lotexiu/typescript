import { describe, expect, it } from 'vitest';
import { CalendarUtils } from '@ts/calendar/utils';
import { PlainDate } from '@ts/plain/date/model';
import type { TIsoWeekday } from '@ts/plain/types';
import vectors from '../../../vectors/plain.json';

describe('CalendarUtils.month', () => {
	for (const v of vectors.grid) {
		it(`${v.year}-${String(v.month).padStart(2, '0')} semana começa em ${v.weekStart}, ${v.weeks}${v.note ? ` (${v.note})` : ''}`, () => {
			const cells = CalendarUtils.month(v.year, v.month, { weekStart: v.weekStart as TIsoWeekday, weeks: v.weeks as number | 'auto' });
			expect(cells).toHaveLength(v.cells);
			expect(cells[0].date.toString()).toBe(v.first);
			expect(cells.at(-1)!.date.toString()).toBe(v.last);
			expect(cells.filter((cell) => cell.inMonth)).toHaveLength(v.inMonth);
			expect(cells[0].date.dayOfWeek).toBe(v.weekStart);
		});
	}

	it('datas consecutivas, sem buracos nem repetição', () => {
		const cells = CalendarUtils.month(2026, 10);
		cells.slice(1).forEach((cell, index) => expect(cells[index].date.daysUntil(cell.date)).toBe(1));
	});

	it('weekdays na ordem do cabeçalho', () => {
		expect(CalendarUtils.weekdays()).toEqual([1, 2, 3, 4, 5, 6, 7]);
		expect(CalendarUtils.weekdays(7)).toEqual([7, 1, 2, 3, 4, 5, 6]);
	});

	it('inRange com limites opcionais', () => {
		const min = PlainDate.parse('2026-10-10');
		const max = PlainDate.parse('2026-10-20');
		expect(CalendarUtils.inRange(PlainDate.parse('2026-10-10'), min, max)).toBe(true);
		expect(CalendarUtils.inRange(PlainDate.parse('2026-10-21'), min, max)).toBe(false);
		expect(CalendarUtils.inRange(PlainDate.parse('2000-01-01'))).toBe(true);
	});
});
