import { describe, expect, it } from 'vitest';
import { createTypePlugin } from '@ts/html/plugins/registry/implementations';
import { NumberPlugin } from '@ts/html/plugins/number/model';
import { DatePlugin } from '@ts/html/plugins/date/model';

describe('createTypePlugin', () => {
	it('resolves "number" to a working NumberPlugin instance', () => {
		const plugin = createTypePlugin('number', { min: 0, max: 10 });
		expect(plugin).toBeInstanceOf(NumberPlugin);

		plugin.parse('42');
		expect(plugin.value).toBe(10);
	});

	it('resolves "date" to a working DatePlugin instance', () => {
		const plugin = createTypePlugin('date');
		expect(plugin).toBeInstanceOf(DatePlugin);

		plugin.parse('2024-03-15');
		expect(plugin.value?.toISOString()).toBe('2024-03-15T00:00:00.000Z');
	});

	it('creates an independent instance per call', () => {
		const first = createTypePlugin('number');
		const second = createTypePlugin('number');

		first.parse('1');
		expect(second.value).toBeUndefined();
	});
});
