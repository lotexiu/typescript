import { describe, it, expect } from 'vitest';
import { datePicker } from '@ts/headless/date-picker/model';

describe('datePicker month/year navigation', () => {
	it('does not overflow into the wrong month when navigating from a day that does not exist in the target month', () => {
		const dp = datePicker({ initial: new Date(2026, 2, 31) }); // March 31
		dp.prevMonth();
		expect([dp.year(), dp.month()]).toEqual([2026, 1]); // February, not rolled back into March
	});

	it('rolls the year when navigating past January/December', () => {
		const dp = datePicker({ initial: new Date(2026, 0, 15) });
		dp.prevMonth();
		expect([dp.year(), dp.month()]).toEqual([2025, 11]);
	});

	it('nextYear/prevYear and the 12-year block navigation move by whole years', () => {
		const dp = datePicker({ initial: new Date(2026, 0, 1) });
		dp.nextYear();
		expect(dp.year()).toBe(2027);
		dp.nextYearBlock();
		expect(dp.year()).toBe(2039);
	});
});

describe('datePicker.days (calendar grid)', () => {
	it('produces a fixed 42-cell grid spanning into the adjacent months', () => {
		const dp = datePicker({ initial: new Date(2026, 0, 1) });
		expect(dp.days()).toHaveLength(42);
	});

	it('marks only cells belonging to the displayed month as `isCurrentMonth`', () => {
		const dp = datePicker({ initial: new Date(2026, 0, 1) });
		const currentMonthCells = dp.days().filter((d) => d.isCurrentMonth);
		expect(currentMonthCells).toHaveLength(31); // January has 31 days
		expect(currentMonthCells.every((d) => d.date.getMonth() === 0)).toBe(true);
	});

	it('marks `isDisabled` for cells outside minDate/maxDate, regardless of time-of-day', () => {
		const dp = datePicker({
			initial: new Date(2026, 0, 15),
			minDate: new Date(2026, 0, 10, 23, 59),
			maxDate: new Date(2026, 0, 20, 0, 0),
		});
		const jan9 = dp.days().find((d) => d.date.toDateString() === new Date(2026, 0, 9).toDateString());
		const jan10 = dp.days().find((d) => d.date.toDateString() === new Date(2026, 0, 10).toDateString());
		const jan20 = dp.days().find((d) => d.date.toDateString() === new Date(2026, 0, 20).toDateString());
		expect(jan9?.isDisabled).toBe(true);
		expect(jan10?.isDisabled).toBe(false); // same calendar day as minDate, time-of-day ignored
		expect(jan20?.isDisabled).toBe(false);
	});
});

describe('datePicker.selectDate (single mode)', () => {
	it('sets `selectedStart` and closes `open`', () => {
		const dp = datePicker({ initial: new Date(2026, 0, 1) });
		dp.open.on();
		dp.selectDate(new Date(2026, 0, 15));
		expect(dp.selectedStart()?.toDateString()).toBe(new Date(2026, 0, 15).toDateString());
		expect(dp.open()).toBe(false);
	});

	it('is a no-op when the date is outside minDate/maxDate', () => {
		const dp = datePicker({ minDate: new Date(2026, 0, 10), maxDate: new Date(2026, 0, 20) });
		dp.selectDate(new Date(2026, 0, 5));
		expect(dp.selectedStart()).toBeUndefined();
	});
});

describe('datePicker.selectDate (range mode)', () => {
	function rangePicker() {
		const dp = datePicker({ mode: 'range' });
		dp.selectYear(2026);
		dp.selectMonth(0); // navigate the cursor to January 2026 without touching selection
		return dp;
	}

	it('the first click sets `selectedStart` only and keeps `open`', () => {
		const dp = rangePicker();
		dp.open.on();
		dp.selectDate(new Date(2026, 0, 10));
		expect(dp.selectedStart()?.toDateString()).toBe(new Date(2026, 0, 10).toDateString());
		expect(dp.selectedEnd()).toBeUndefined();
		expect(dp.open()).toBe(true);
	});

	it('the second click completes the range and closes `open`', () => {
		const dp = rangePicker();
		dp.open.on();
		dp.selectDate(new Date(2026, 0, 10));
		dp.selectDate(new Date(2026, 0, 20));
		expect(dp.selectedStart()?.toDateString()).toBe(new Date(2026, 0, 10).toDateString());
		expect(dp.selectedEnd()?.toDateString()).toBe(new Date(2026, 0, 20).toDateString());
		expect(dp.open()).toBe(false);
	});

	it('picking an earlier date as the second click swaps start/end into order', () => {
		const dp = rangePicker();
		dp.selectDate(new Date(2026, 0, 10));
		dp.selectDate(new Date(2026, 0, 5));
		expect(dp.selectedStart()?.toDateString()).toBe(new Date(2026, 0, 5).toDateString());
		expect(dp.selectedEnd()?.toDateString()).toBe(new Date(2026, 0, 10).toDateString());
	});

	it('a third click starts a new range instead of extending the completed one', () => {
		const dp = rangePicker();
		dp.selectDate(new Date(2026, 0, 10));
		dp.selectDate(new Date(2026, 0, 20));
		dp.selectDate(new Date(2026, 0, 1));
		expect(dp.selectedStart()?.toDateString()).toBe(new Date(2026, 0, 1).toDateString());
		expect(dp.selectedEnd()).toBeUndefined();
	});

	it('marks the strictly-between cells `isInRange`, and the endpoints as `isRangeStart`/`isRangeEnd` but not `isInRange`', () => {
		const dp = rangePicker();
		dp.selectDate(new Date(2026, 0, 5));
		dp.selectDate(new Date(2026, 0, 10));
		const mid = dp.days().find((d) => d.date.toDateString() === new Date(2026, 0, 7).toDateString());
		const start = dp.days().find((d) => d.date.toDateString() === new Date(2026, 0, 5).toDateString());
		const end = dp.days().find((d) => d.date.toDateString() === new Date(2026, 0, 10).toDateString());
		expect(mid?.isInRange).toBe(true);
		expect(start?.isRangeStart).toBe(true);
		expect(start?.isInRange).toBe(false);
		expect(end?.isRangeEnd).toBe(true);
		expect(end?.isInRange).toBe(false);
	});
});

describe('datePicker.clear', () => {
	it('clears both selectedStart and selectedEnd', () => {
		const dp = datePicker({ mode: 'range' });
		dp.selectDate(new Date(2026, 0, 5));
		dp.selectDate(new Date(2026, 0, 10));
		dp.clear();
		expect(dp.selectedStart()).toBeUndefined();
		expect(dp.selectedEnd()).toBeUndefined();
	});
});

describe('datePicker view drill-down', () => {
	it('starts in "days" view', () => {
		expect(datePicker().view()).toBe('days');
	});

	it('openYearView() switches to "years" and yearItems() lists a 12-year block', () => {
		const dp = datePicker({ initial: new Date(2026, 0, 1) });
		dp.openYearView();
		expect(dp.view()).toBe('years');
		expect(dp.yearItems()).toHaveLength(12);
		expect(dp.yearItems()).toContain(2026);
	});

	it('selectYear() sets the year and drops into "months" view', () => {
		const dp = datePicker({ initial: new Date(2026, 0, 1) });
		dp.selectYear(2030);
		expect(dp.year()).toBe(2030);
		expect(dp.view()).toBe('months');
	});

	it('selectMonth() sets the month and drops into "days" view', () => {
		const dp = datePicker({ initial: new Date(2026, 0, 1) });
		dp.openMonthView();
		dp.selectMonth(5);
		expect(dp.month()).toBe(5);
		expect(dp.view()).toBe('days');
	});
});

describe('datePicker.open', () => {
	it('resets the cursor to the month of `selectedStart` and the view to "days" whenever it opens', () => {
		const dp = datePicker({ initial: new Date(2026, 0, 1) });
		dp.nextYear();
		dp.openYearView();
		dp.selectDate(new Date(2027, 5, 10)); // pick a date while browsing a different year/view
		dp.open.on();
		expect([dp.year(), dp.month(), dp.view()]).toEqual([2027, 5, 'days']);
	});
});
