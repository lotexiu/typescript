import { describe, it, expect } from 'vitest';
import { ThemeStyle } from '@ts/theme/style/model';
import { TonalPalette } from '@ts/theme/palette/model';

const neutral = new TonalPalette('#808080', 'neutral');

describe('ThemeStyle', () => {
	it('exposes name/palettes/roles/components/metric as given', () => {
		const palettes = { neutral };
		const roles = { bg: { palette: 'neutral', tone: { dark: 10, light: 98 } } } as const;
		const style = new ThemeStyle({ name: 'my-style', palettes, roles, components: { radius: 4 }, metric: 'APCA' });
		expect(style.name).toBe('my-style');
		expect(style.palettes).toBe(palettes);
		expect(style.roles).toBe(roles);
		expect(style.components).toEqual({ radius: 4 });
		expect(style.metric).toBe('APCA');
	});

	it('defaults to no components and the WCAG 2.1 metric', () => {
		const style = new ThemeStyle({ name: 's', palettes: { neutral }, roles: {} });
		expect(style.components).toEqual({});
		expect(style.metric).toBe('WCAG21');
	});

	it('refuses, when created, a role that cites a palette id the style does not declare', () => {
		expect(() => new ThemeStyle({ name: 's', palettes: { neutral }, roles: { bg: { palette: 'nuetral' as 'neutral', tone: 10 } } })).toThrow(
			expect.objectContaining({ type: 'undeclaredPalette', cause: { role: 'bg', palette: 'nuetral', declared: ['neutral'] } })
		);
	});

	it('catches a mistyped palette id at compile time when the ids are literals', () => {
		// @ts-expect-error 'nuetral' is not one of the declared ids ('neutral')
		const attempt = () => new ThemeStyle({ name: 's', palettes: { neutral }, roles: { bg: { palette: 'nuetral', tone: 10 } } });
		expect(attempt).toThrow();
	});
});
