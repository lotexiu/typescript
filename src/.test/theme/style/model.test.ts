import { describe, it, expect } from 'vitest';
import { ThemeStyle } from '@ts/theme/style/model';
import { CustomPalette, TonalPalette } from '@ts/theme/palette/model';

describe('ThemeStyle', () => {
	it('exposes name/slotColors/components as given to the constructor', () => {
		const primary = new CustomPalette('primary', { 50: '#808080' });
		const style = new ThemeStyle('my-style', { primary }, { radius: 4 });
		expect(style.name).toBe('my-style');
		expect(style.slotColors.primary).toBe(primary);
		expect(style.components).toEqual({ radius: 4 });
	});
});

describe('ThemeStyle.resolve', () => {
	const style = new ThemeStyle('s', { primary: new TonalPalette('#1a5fb4', 'p'), neutral: new TonalPalette('#1a5fb4', 'n').neutral() }, {});

	it('emits accent roles for colored slots and neutral roles for `neutral`', () => {
		const roles = style.resolve('dark');
		expect(Object.keys(roles.primary).sort()).toEqual(['bright', 'container', 'main', 'onContainer', 'onMain']);
		expect(Object.keys(roles.neutral)).toContain('surface2');
	});

	it('differs by mode, and `on*` roles are readable over their base', () => {
		const dark = style.resolve('dark');
		const light = style.resolve('light');
		expect(dark.primary.main.to('oklch').coords[0]).toBeGreaterThan(light.primary.main.to('oklch').coords[0] ?? 0);
		for (const roles of [dark, light]) {
			expect(roles.primary.onMain.contrast(roles.primary.main, 'WCAG21')).toBeGreaterThan(4.5);
			expect(roles.primary.onContainer.contrast(roles.primary.container, 'WCAG21')).toBeGreaterThan(4.5);
		}
	});

	it('merges extra roles over the defaults without dropping them', () => {
		const roles = style.resolve('dark', { neutral: { ink: { dark: 100, light: 0 } } });
		expect(roles.neutral.ink.to('oklch').coords[0]).toBeCloseTo(1, 5);
		expect(roles.neutral.background).toBeDefined();
	});
});
