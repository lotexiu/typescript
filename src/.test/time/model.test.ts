import { describe, it, expect } from 'vitest';
import { Time } from '@ts/time/model';

describe('Time field getters', () => {
	it('reads every date component from the wrapped Date', () => {
		const t = new Time(new Date(2024, 5, 15, 10, 30, 45, 500));
		expect(t.year()).toBe(2024);
		expect(t.month()).toBe(5);
		expect(t.day()).toBe(15);
		expect(t.hour()).toBe(10);
		expect(t.minutes()).toBe(30);
		expect(t.seconds()).toBe(45);
		expect(t.milliseconds()).toBe(500);
	});

	it('defaults to the current date/time when constructed with no argument', () => {
		const before = Date.now();
		const t = new Time();
		const after = Date.now();
		expect(t.getTime()).toBeGreaterThanOrEqual(before);
		expect(t.getTime()).toBeLessThanOrEqual(after);
	});
});

describe('Time field setters', () => {
	it('year/month/day/hour/... mutate the wrapped date in place', () => {
		const t = new Time(new Date(2024, 5, 15));
		t.year.set(2025);
		expect(t.year()).toBe(2025);
		t.month.set(0);
		expect(t.month()).toBe(0);
		t.day.set(1);
		expect(t.day()).toBe(1);
	});

	it('weekday shifts the date to land on the target day of week', () => {
		const t = new Time(new Date(2024, 5, 15)); // a Saturday
		expect(t.weekday()).toBe(6);
		t.weekday.set(0); // shift back to Sunday of the same week
		expect(t.weekday()).toBe(0);
		expect(t.day()).toBe(9);
	});
});

describe('Time.getTime / toString / toISOString stay live (regression: no longer bound to the construction-time date)', () => {
	it('getTime() reflects the constructor date', () => {
		const date = new Date(2024, 5, 15);
		const t = new Time(date);
		expect(t.getTime()).toBe(date.getTime());
	});

	it('getTime() reflects a later field mutation, not the original constructor date', () => {
		const t = new Time(new Date(2024, 5, 15));
		const originalTime = t.getTime();
		t.year.set(2030);
		expect(t.getTime()).not.toBe(originalTime);
		expect(new Date(t.getTime()).getFullYear()).toBe(2030);
	});

	it('toString()/toISOString()/toJSON() reflect the current wrapped date', () => {
		const t = new Time(new Date(2024, 5, 15, 12, 0, 0));
		const raw = new Date(2024, 5, 15, 12, 0, 0);
		expect(t.toString()).toBe(raw.toString());
		expect(t.toISOString()).toBe(raw.toISOString());
		expect(t.toJSON()).toBe(raw.toJSON());
	});

	it('getTimezoneOffset()/toUTCString() delegate to the wrapped date', () => {
		const raw = new Date(2024, 5, 15);
		const t = new Time(raw);
		expect(t.getTimezoneOffset()).toBe(raw.getTimezoneOffset());
		expect(t.toUTCString()).toBe(raw.toUTCString());
	});
});

describe('Time calendar computations', () => {
	it('firstDay/totalDays/totalWeeks for a known month (June 2024)', () => {
		const t = new Time(new Date(2024, 5, 15));
		expect(t.firstDay()).toBe(new Date(2024, 5, 1).getDay());
		expect(t.totalDays()).toBe(30);
		expect(t.totalWeeks()).toBe(5);
	});

	it('calendarDays always produces exactly 42 cells', () => {
		const t = new Time(new Date(2024, 5, 15));
		expect(t.calendarDays()).toHaveLength(42);
	});

	it('calendarDays fills a known month (June 2024, starts on Saturday) with correct leading/trailing days', () => {
		const t = new Time(new Date(2024, 5, 15));
		const days = t.calendarDays();
		// June 1 2024 is a Saturday -> 6 leading days from May (26-31)
		expect(days.slice(0, 6)).toEqual([
			{ day: 26, month: 4 },
			{ day: 27, month: 4 },
			{ day: 28, month: 4 },
			{ day: 29, month: 4 },
			{ day: 30, month: 4 },
			{ day: 31, month: 4 },
		]);
		expect(days[6]).toEqual({ day: 1, month: 5 });
		expect(days[35]).toEqual({ day: 30, month: 5 });
		// 42 - 6 leading - 30 June days = 6 trailing July days
		expect(days.slice(36)).toEqual([
			{ day: 1, month: 6 },
			{ day: 2, month: 6 },
			{ day: 3, month: 6 },
			{ day: 4, month: 6 },
			{ day: 5, month: 6 },
			{ day: 6, month: 6 },
		]);
	});

	it('marks the current day with `today: true`', () => {
		const t = new Time(new Date(2024, 5, 15));
		const days = t.calendarDays();
		const todayCell = days.find((d) => d.today);
		expect(todayCell).toEqual({ day: 15, month: 5, today: true });
	});

	it('recomputes when the underlying date field changes', () => {
		const t = new Time(new Date(2024, 5, 15));
		t.month.set(0); // January
		expect(t.totalDays()).toBe(31);
	});
});
