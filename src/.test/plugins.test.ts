import { describe, expect, it } from 'vitest';
import { MaskPlugin } from '@ts/html/plugins/mask/model';
import { NumberPlugin } from '@ts/html/plugins/number/model';

describe('MaskPlugin', () => {
	it('formats an initial value on creation', () => {
		const plugin = new MaskPlugin('000.000.000-00', '06797600000');
		expect(plugin.value).toBe('067.976.000-00');
	});

	it('reformats on update, delegating to MaskUtils', () => {
		const plugin = new MaskPlugin('000.000.000-00');
		plugin.update('067976');
		expect(plugin.value).toBe('067.976');
	});

	it('notifies subscribers when the formatted value changes', () => {
		const plugin = new MaskPlugin('000.000.000-00');
		const seen: string[] = [];
		plugin.subscribe((value) => seen.push(value));

		plugin.update('0679');
		expect(seen).toEqual([plugin.value]);
		expect(seen).toHaveLength(1);
	});

	it('reformats the already-typed raw value when the pattern changes at runtime', () => {
		const plugin = new MaskPlugin('000-000');
		plugin.update('123456');
		expect(plugin.value).toBe('123-456');

		// Mesma quantidade de dígitos, separador diferente: o raw guardado
		// internamente é reaproveitado, não precisa ser retypado.
		plugin.setPattern('000.000');
		expect(plugin.value).toBe('123.456');
	});

	it('does nothing when set to the same pattern it already has', () => {
		const plugin = new MaskPlugin('000.000.000-00');
		plugin.update('067976');
		const seen: string[] = [];
		plugin.subscribe((value) => seen.push(value));

		plugin.setPattern('000.000.000-00');

		expect(seen).toHaveLength(0);
	});
});

describe('NumberPlugin', () => {
	it('parses valid numeric text', () => {
		const plugin = new NumberPlugin();
		plugin.parse('42');
		expect(plugin.value).toBe(42);
	});

	it('treats empty text as undefined', () => {
		const plugin = new NumberPlugin();
		plugin.parse('42');
		plugin.parse('');
		expect(plugin.value).toBeUndefined();
	});

	it('treats non-numeric text as undefined, without judging validity', () => {
		const plugin = new NumberPlugin();
		plugin.parse('abc');
		expect(plugin.value).toBeUndefined();
	});

	it('clamps parsed values into [min, max] instead of reporting an error', () => {
		const plugin = new NumberPlugin({ min: 0, max: 10 });

		plugin.parse('42');
		expect(plugin.value).toBe(10);

		plugin.parse('-5');
		expect(plugin.value).toBe(0);

		plugin.parse('7');
		expect(plugin.value).toBe(7);
	});

	it('reapplies the new limits to the already-stored value via setLimits', () => {
		const plugin = new NumberPlugin({ min: 0, max: 100 });
		plugin.parse('50');
		expect(plugin.value).toBe(50);

		plugin.setLimits({ min: 0, max: 20 });
		expect(plugin.value).toBe(20);
	});
});
