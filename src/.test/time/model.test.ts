import { describe, it, expect } from 'vitest';
import { Time } from '@ts/time/model';

describe('Time field getters', () => {
	it('reads every date component from the wrapped Date', () => {
		const time = new Time(new Date(2024, 5, 15, 10, 30, 45, 500));
		expect(time.year()).toBe(2024);
		expect(time.month()).toBe(5);
		expect(time.day()).toBe(15);
		expect(time.hour()).toBe(10);
		expect(time.minutes()).toBe(30);
		expect(time.seconds()).toBe(45);
		expect(time.milliseconds()).toBe(500);
	});

	it('defaults to the current date/time when constructed with no argument', () => {
		const before = Date.now();
		const time = new Time();
		const after = Date.now();
		expect(time.getTime()).toBeGreaterThanOrEqual(before);
		expect(time.getTime()).toBeLessThanOrEqual(after);
	});
});

describe('Time field setters', () => {
	it('year/month/day/hour/... mutate the wrapped date in place', () => {
		const time = new Time(new Date(2024, 5, 15));
		time.year.set(2025);
		expect(time.year()).toBe(2025);
		time.month.set(0);
		expect(time.month()).toBe(0);
		time.day.set(1);
		expect(time.day()).toBe(1);
	});

	it('weekday shifts the date to land on the target day of week', () => {
		const time = new Time(new Date(2024, 5, 15)); // a Saturday
		expect(time.weekday()).toBe(6);
		time.weekday.set(0); // shift back to Sunday of the same week
		expect(time.weekday()).toBe(0);
		expect(time.day()).toBe(9);
	});
});

describe('Time.getTime / toString / toISOString stay live (regression: no longer bound to the construction-time date)', () => {
	it('getTime() reflects the constructor date', () => {
		const date = new Date(2024, 5, 15);
		const time = new Time(date);
		expect(time.getTime()).toBe(date.getTime());
	});

	it('getTime() reflects a later field mutation, not the original constructor date', () => {
		const time = new Time(new Date(2024, 5, 15));
		const originalTime = time.getTime();
		time.year.set(2030);
		expect(time.getTime()).not.toBe(originalTime);
		expect(new Date(time.getTime()).getFullYear()).toBe(2030);
	});

	it('toString()/toISOString()/toJSON() reflect the current wrapped date', () => {
		const time = new Time(new Date(2024, 5, 15, 12, 0, 0));
		const raw = new Date(2024, 5, 15, 12, 0, 0);
		expect(time.toString()).toBe(raw.toString());
		expect(time.toISOString()).toBe(raw.toISOString());
		expect(time.toJSON()).toBe(raw.toJSON());
	});

	it('getTimezoneOffset()/toUTCString() delegate to the wrapped date', () => {
		const raw = new Date(2024, 5, 15);
		const time = new Time(raw);
		expect(time.getTimezoneOffset()).toBe(raw.getTimezoneOffset());
		expect(time.toUTCString()).toBe(raw.toUTCString());
	});
});
