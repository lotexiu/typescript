import { describe, it, expect } from 'vitest';
import { TonalPalette } from '@ts/theme/palette/model';
import { RoleUtils } from '@ts/theme/role/utils';
import { ColorUtils } from '@ts/theme/color/utils';
import { TRoleRules } from '@ts/theme/role/types';

const palettes = { brand: new TonalPalette('#3b82f6', 'brand'), gray: new TonalPalette('#808080', 'gray') };
type TPalettes = keyof typeof palettes;

describe('RoleUtils.resolve — tones', () => {
	it('takes the tone from a number, a per-mode record or a function of the context', () => {
		const rules: TRoleRules<TPalettes, 'a' | 'b' | 'c'> = {
			a: { palette: 'brand', tone: 40 },
			b: { palette: 'brand', tone: { dark: 80, light: 30 } },
			c: { palette: 'brand', tone: ({ mode, contrast }) => (mode === 'dark' ? 70 : 20) + contrast * 10 },
		};
		const dark = RoleUtils.resolve(rules, palettes, { mode: 'dark', contrast: 1 }).colors;
		const light = RoleUtils.resolve(rules, palettes, { mode: 'light' }).colors;

		expect(dark.a.toString()).toBe(palettes.brand.get(40).toString());
		expect(dark.b.toString()).toBe(palettes.brand.get(80).toString());
		expect(light.b.toString()).toBe(palettes.brand.get(30).toString());
		expect(dark.c.toString()).toBe(palettes.brand.get(80).toString());
		expect(light.c.toString()).toBe(palettes.brand.get(20).toString());
	});

	it('clamps a tone outside 0..100', () => {
		const { colors } = RoleUtils.resolve({ a: { palette: 'brand', tone: 250 } }, palettes, { mode: 'dark' });
		expect(colors.a.toString()).toBe(palettes.brand.get(100).toString());
	});
});

describe('RoleUtils.resolve — pairs', () => {
	const rules: TRoleRules<TPalettes, 'surface' | 'text'> = {
		surface: { palette: 'gray', tone: 90 },
		text: { palette: 'brand', tone: 70, on: 'surface', min: 4.5 },
	};

	it('reports a failing pair, keeps the authored color and suggests a tone that passes', () => {
		const { colors, checks } = RoleUtils.resolve(rules, palettes, { mode: 'light' });
		const [check] = checks;

		expect(check.passed).toBe(false);
		expect(check.ratio).toBeLessThan(4.5);
		expect(check.suggestion!.ratio).toBeGreaterThanOrEqual(4.5);
		expect(check.suggestion!.tone).toBeLessThan(70);
		expect(colors.text.toString()).toBe(palettes.brand.get(70).toString());
	});

	it('applies the suggestion when `enforce` is set, and later roles see the adjusted color', () => {
		const withDependent: TRoleRules<TPalettes, 'surface' | 'text' | 'hint'> = {
			...rules,
			hint: { palette: 'gray', tone: 50, on: 'text', min: 1 },
		};
		const { colors, checks } = RoleUtils.resolve(withDependent, palettes, { mode: 'light', enforce: true });
		const suggested = checks[0].suggestion!;

		expect(colors.text.toString()).toBe(suggested.color.toString());
		expect(ColorUtils.contrast(colors.text, colors.surface)).toBeGreaterThanOrEqual(4.5);
		expect(checks[1].ratio).toBeCloseTo(ColorUtils.contrast(palettes.gray.get(50), suggested.color));
	});

	it('does not suggest anything for a pair that already passes', () => {
		const { checks } = RoleUtils.resolve({ ...rules, text: { palette: 'brand', tone: 10, on: 'surface', min: 4.5 } }, palettes, { mode: 'light' });
		expect(checks[0].passed).toBe(true);
		expect(checks[0]).not.toHaveProperty('suggestion');
	});

	it('falls back to the most readable tone when none reaches `min`', () => {
		const { checks } = RoleUtils.resolve({ ...rules, text: { palette: 'brand', tone: 70, on: 'surface', min: 50 } }, palettes, { mode: 'light' });
		expect(checks[0].passed).toBe(false);
		expect(checks[0].suggestion!.ratio).toBeLessThan(50);
		expect(checks[0].suggestion!.ratio).toBeGreaterThan(checks[0].ratio);
	});

	it('does not check a role that sits `on` another without a `min`', () => {
		const { checks } = RoleUtils.resolve({ ...rules, text: { palette: 'brand', tone: 70, on: 'surface' } }, palettes, { mode: 'light' });
		expect(checks).toEqual([]);
	});

	it('measures with the metric it is given, built-in or custom', () => {
		const apca = RoleUtils.resolve(rules, palettes, { mode: 'light', metric: 'APCA' }).checks[0];
		const custom = RoleUtils.resolve(rules, palettes, { mode: 'light', metric: () => 99 }).checks[0];

		expect(apca.ratio).toBeCloseTo(ColorUtils.contrast(palettes.brand.get(70), palettes.gray.get(90), 'APCA'));
		expect(apca.ratio).toBeGreaterThan(21);
		expect(custom.ratio).toBe(99);
		expect(custom.passed).toBe(true);
	});
});

describe('RoleUtils.resolve — errors', () => {
	it('throws when a role sits on one declared after it', () => {
		const rules: TRoleRules<TPalettes, 'text' | 'surface'> = {
			text: { palette: 'brand', tone: 10, on: 'surface', min: 4.5 },
			surface: { palette: 'gray', tone: 90 },
		};
		expect(() => RoleUtils.resolve(rules, palettes, { mode: 'light' })).toThrow(
			expect.objectContaining({ type: 'unresolvedBackground', cause: { role: 'text', on: 'surface' } })
		);
	});

	it('throws when a role sits on itself or on a name that does not exist', () => {
		const unresolved = expect.objectContaining({ type: 'unresolvedBackground' });
		expect(() => RoleUtils.resolve({ a: { palette: 'brand', tone: 10, on: 'a' } }, palettes, { mode: 'light' })).toThrow(unresolved);
		expect(() => RoleUtils.resolve({ a: { palette: 'brand', tone: 10, on: 'constructor' as 'a' } }, palettes, { mode: 'light' })).toThrow(unresolved);
	});

	it('throws when a role points to a palette that was not given', () => {
		expect(() => RoleUtils.resolve({ a: { palette: 'missing' as TPalettes, tone: 10 } }, palettes, { mode: 'light' })).toThrow(
			expect.objectContaining({ type: 'unknownPalette', cause: { role: 'a', palette: 'missing' } })
		);
	});
});
