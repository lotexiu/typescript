import { describe, it, expect } from 'vitest';
import { DateUtils } from '@tsn-date/utils';

describe('DateUtils.formatMS', () => {
	it('formats sub-millisecond durations as nanoseconds', () => {
		expect(DateUtils.formatMS(0.0005)).toBe('500 ns');
	});

	it('formats durations under 1ms as microseconds', () => {
		expect(DateUtils.formatMS(0.5)).toBe('500 µs');
	});

	it('formats durations under 1s as milliseconds', () => {
		expect(DateUtils.formatMS(500)).toBe('500 ms');
	});

	it('formats durations under a minute as seconds', () => {
		expect(DateUtils.formatMS(3000)).toBe('3 s');
	});

	it('formats durations under an hour as minutes', () => {
		expect(DateUtils.formatMS(120000)).toBe('2 min');
	});

	it('formats durations under a day as hours', () => {
		expect(DateUtils.formatMS(7200000)).toBe('2 hour');
	});

	it('falls back to the largest unit (week) beyond the last threshold', () => {
		expect(DateUtils.formatMS(20000000000)).toBe('33 week');
	});
});

describe('DateUtils.set', () => {
	it('sets each provided field independently', () => {
		const date = new Date(2024, 5, 15, 10, 30, 45, 500);
		DateUtils.set(date, { year: 2025 });
		expect(date.getFullYear()).toBe(2025);
	});

	it('leaves omitted fields untouched', () => {
		const date = new Date(2024, 5, 15, 10, 30, 45, 500);
		DateUtils.set(date, { year: 2025 });
		expect(date.getMonth()).toBe(5);
		expect(date.getDate()).toBe(15);
	});

	it('returns the same (mutated) date instance', () => {
		const date = new Date(2024, 5, 15);
		expect(DateUtils.set(date, { year: 2025 })).toBe(date);
	});

	// TDateSetValue fields are plain numbers, so 0 is a legitimate value (January,
	// midnight, etc.) distinct from "field not provided" — these pin down that contract.
	it('sets month to January (0)', () => {
		const date = new Date(2024, 5, 15);
		DateUtils.set(date, { month: 0 });
		expect(date.getMonth()).toBe(0);
	});

	it('sets hour to midnight (0)', () => {
		const date = new Date(2024, 5, 15, 10);
		DateUtils.set(date, { hour: 0 });
		expect(date.getHours()).toBe(0);
	});

	it('sets minute to 0', () => {
		const date = new Date(2024, 5, 15, 10, 30);
		DateUtils.set(date, { minute: 0 });
		expect(date.getMinutes()).toBe(0);
	});

	it('sets second to 0', () => {
		const date = new Date(2024, 5, 15, 10, 30, 45);
		DateUtils.set(date, { second: 0 });
		expect(date.getSeconds()).toBe(0);
	});

	it('sets millisecond to 0', () => {
		const date = new Date(2024, 5, 15, 10, 30, 45, 500);
		DateUtils.set(date, { millisecond: 0 });
		expect(date.getMilliseconds()).toBe(0);
	});
});

describe('DateUtils.increment', () => {
	it('adds to each field relative to the current value', () => {
		const date = new Date(2024, 5, 15, 10, 30, 45, 500);
		DateUtils.increment(date, { day: 1, hour: 1 });
		expect(date.getDate()).toBe(16);
		expect(date.getHours()).toBe(11);
	});

	it('supports negative deltas', () => {
		const date = new Date(2024, 5, 15);
		DateUtils.increment(date, { day: -1 });
		expect(date.getDate()).toBe(14);
	});

	it('lands on hour 0 when incrementing to exactly midnight', () => {
		const date = new Date(2024, 5, 15, 1);
		DateUtils.increment(date, { hour: -1 });
		expect(date.getHours()).toBe(0);
	});
});

describe('DateUtils.setEnd', () => {
	it('moves the day to the last day of the month', () => {
		const date = new Date(2024, 1, 10); // February 2024 (leap year)
		DateUtils.setEnd(date, { day: true });
		expect(date.getDate()).toBe(29);
	});

	it('moves the time to the last millisecond of the second', () => {
		const date = new Date(2024, 1, 10, 5, 5, 5, 5);
		DateUtils.setEnd(date, { hour: true, minute: true, second: true, millisecond: true });
		expect(date.getHours()).toBe(23);
		expect(date.getMinutes()).toBe(59);
		expect(date.getSeconds()).toBe(59);
		expect(date.getMilliseconds()).toBe(999);
	});

	it('leaves fields not flagged untouched', () => {
		const date = new Date(2024, 1, 10, 5);
		DateUtils.setEnd(date, { day: true });
		expect(date.getHours()).toBe(5);
	});
});

describe('DateUtils.setStart', () => {
	it('resets flagged fields to their start-of-unit value', () => {
		const date = new Date(2024, 5, 15, 10, 30, 45, 500);
		DateUtils.setStart(date, {
			month: true,
			day: true,
			hour: true,
			minute: true,
			second: true,
			millisecond: true,
		});
		expect(date.getMonth()).toBe(0);
		expect(date.getDate()).toBe(1);
		expect(date.getHours()).toBe(0);
		expect(date.getMinutes()).toBe(0);
		expect(date.getSeconds()).toBe(0);
		expect(date.getMilliseconds()).toBe(0);
	});

	it('leaves fields not flagged untouched', () => {
		const date = new Date(2024, 5, 15, 10);
		DateUtils.setStart(date, { hour: true });
		expect(date.getDate()).toBe(15);
	});
});
