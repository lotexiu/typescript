import { describe, expect, it } from 'vitest';
import { DateUtils } from '@tsn-date/utils';
import { DatePlugin } from '@ts/html/plugins/date/model';

describe('DateUtils.parseISO', () => {
	it('parses a valid ISO date as UTC midnight', () => {
		const date = DateUtils.parseISO('2024-03-15');
		expect(date?.toISOString()).toBe('2024-03-15T00:00:00.000Z');
	});

	it('rejects calendar-invalid dates instead of letting them roll over', () => {
		expect(DateUtils.parseISO('2024-02-30')).toBeUndefined();
		expect(DateUtils.parseISO('2024-13-01')).toBeUndefined();
	});

	it('accepts a real leap day and rejects a non-leap-year Feb 29', () => {
		expect(DateUtils.parseISO('2024-02-29')).toBeDefined();
		expect(DateUtils.parseISO('2023-02-29')).toBeUndefined();
	});

	it('rejects empty text and non-ISO formats', () => {
		expect(DateUtils.parseISO('')).toBeUndefined();
		expect(DateUtils.parseISO('15/03/2024')).toBeUndefined();
		expect(DateUtils.parseISO('not a date')).toBeUndefined();
	});
});

describe('DatePlugin', () => {
	it('parses ISO text by default', () => {
		const plugin = new DatePlugin();
		plugin.parse('2024-03-15');
		expect(plugin.value?.toISOString()).toBe('2024-03-15T00:00:00.000Z');
	});

	it('treats unparseable text as undefined', () => {
		const plugin = new DatePlugin();
		plugin.parse('garbage');
		expect(plugin.value).toBeUndefined();
	});

	it('notifies subscribers when the parsed value changes', () => {
		const plugin = new DatePlugin();
		const seen: (Date | undefined)[] = [];
		plugin.subscribe((value) => seen.push(value));

		plugin.parse('2024-03-15');
		expect(seen).toHaveLength(1);
	});

	it('accepts a custom parse function via options, instead of guessing a "universal" format', () => {
		const plugin = new DatePlugin({
			parse: (raw) => {
				const [day, month, year] = raw.split('/').map(Number);
				return day && month && year ? new Date(Date.UTC(year, month - 1, day)) : undefined;
			},
		});

		plugin.parse('15/03/2024');
		expect(plugin.value?.toISOString()).toBe('2024-03-15T00:00:00.000Z');
	});

	it('setParse swaps the parser at runtime', () => {
		const plugin = new DatePlugin();
		plugin.parse('2024-03-15');
		expect(plugin.value).toBeDefined();

		plugin.setParse(() => undefined);
		plugin.parse('2024-03-15');
		expect(plugin.value).toBeUndefined();
	});
});
