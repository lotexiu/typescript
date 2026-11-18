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

describe('ThemeStyle adjustments and tokens', () => {
	it('defaults to no adjustments and to tokens that resolve to an empty object', () => {
		const style = new ThemeStyle({ name: 's', palettes: { neutral }, roles: {} });
		expect(style.adjustments).toEqual({});
		expect(style.tokens({ mode: 'dark', contrast: 0, palettes: { neutral }, roles: {}, adjustments: {} })).toEqual({});
	});

	it('refuses, when created, an adjustment whose default does not fit its definition', () => {
		expect(
			() =>
				new ThemeStyle({
					name: 's',
					palettes: { neutral },
					roles: {},
					adjustments: { edge: { kind: 'choice', default: 'left', options: ['top', 'bottom'] } },
				})
		).toThrow(expect.objectContaining({ type: 'invalidAdjustment' }));
	});

	it('types the tokens context with the declared role names, palette ids and adjustment values', () => {
		const style = new ThemeStyle({
			name: 's',
			palettes: { neutral },
			roles: { surface: { palette: 'neutral', tone: 10 } },
			adjustments: { edge: { kind: 'choice', default: 'bottom', options: ['bottom', 'top'] }, roundness: { kind: 'range', default: 1, min: 0, max: 2 } },
			tokens: ({ roles, palettes, adjustments }) => {
				const edge: 'bottom' | 'top' = adjustments.edge;
				const roundness: number = adjustments.roundness;
				// @ts-expect-error
				void roles.window;
				return { surface: roles.surface, shade: palettes.neutral.get(5), edge, radius: `${roundness * 8}px` };
			},
		});
		const tokens = style.tokens({ mode: 'dark', contrast: 0, palettes: { neutral }, roles: { surface: neutral.get(10) }, adjustments: { edge: 'top', roundness: 2 } });
		const radius: string = tokens.radius;
		expect(radius).toBe('16px');
		expect(tokens.edge).toBe('top');
	});
});
