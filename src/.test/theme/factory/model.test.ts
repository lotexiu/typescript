import { describe, it, expect } from 'vitest';
import { PaletteFactory } from '@ts/theme/factory/model';
import { Theme } from '@ts/theme/model';
import { ThemeStyle } from '@ts/theme/style/model';
import { TonalPalette } from '@ts/theme/palette/model';

const ocean = new TonalPalette('#1a5fb4', 'ocean');
const sunset = new TonalPalette('#c0392b', 'sunset');

/** One color in, three palettes out. */
const oneColor = () =>
	new PaletteFactory({
		seeds: { brand: { label: 'Brand color', default: ocean } },
		palettes: {
			primary: ({ seeds }) => seeds.brand,
			secondary: ({ seeds }) => seeds.brand.derive({ hueShift: 48, chromaScale: 0.7, name: 'secondary' }),
			neutral: ({ seeds }) => seeds.brand.neutral(undefined, 'neutral'),
		},
	});

describe('PaletteFactory.seeds', () => {
	it('exposes every seed with its label and default palette, for a UI to list', () => {
		const factory = oneColor();
		expect(Object.keys(factory.seeds)).toEqual(['brand']);
		expect(factory.seeds.brand.label).toBe('Brand color');
		expect(factory.seeds.brand.default).toBe(ocean);
	});

	it('uses the id as label when none is given, and turns a color default into a palette', () => {
		const factory = new PaletteFactory({ seeds: { accent: { default: '#ff8800' } }, palettes: { accent: ({ seeds }) => seeds.accent } });
		expect(factory.seeds.accent.label).toBe('accent');
		expect(factory.seeds.accent.default.get(50).toString({ format: 'hex' })).toMatch(/^#/);
	});
});

describe('PaletteFactory.build', () => {
	it('with no values, uses the default seeds and produces every palette id', () => {
		const palettes = oneColor().build();
		expect(Object.keys(palettes)).toEqual(['primary', 'secondary', 'neutral']);
		expect(palettes.primary).toBe(ocean);
	});

	it('accepts a palette or just a color as the value of a seed', () => {
		const factory = oneColor();
		expect(factory.build({ brand: sunset }).primary).toBe(sunset);
		const fromColor = factory.build({ brand: '#2d6a2d' });
		expect(fromColor.primary.get(50).toString({ format: 'hex' })).toBe(new TonalPalette('#2d6a2d', 'x').get(50).toString({ format: 'hex' }));
	});

	it('derived palettes follow the seed', () => {
		const factory = oneColor();
		const first = factory.build({ brand: ocean }).secondary.get(50).toString();
		const second = factory.build({ brand: sunset }).secondary.get(50).toString();
		expect(second).not.toBe(first);
	});

	it('two colors in, as many palettes out as the rules ask for', () => {
		const factory = new PaletteFactory({
			seeds: { brand: { default: ocean }, accent: { default: sunset } },
			palettes: {
				primary: ({ seeds }) => seeds.brand,
				highlight: ({ seeds }) => seeds.accent,
				highlightSoft: ({ seeds }) => seeds.accent.derive({ chromaScale: 0.4 }),
				neutral: ({ seeds }) => seeds.brand.neutral(),
			},
		});
		const palettes = factory.build({ accent: '#ff00ff' });
		expect(Object.keys(palettes)).toEqual(['primary', 'highlight', 'highlightSoft', 'neutral']);
		expect(palettes.primary).toBe(ocean); // brand kept its default
		expect(palettes.highlight).not.toBe(sunset);
	});

	it('a hand-picked palette replaces the generated one', () => {
		const manual = new TonalPalette('#00ff00', 'manual');
		const palettes = oneColor().build({ brand: sunset }, { secondary: manual });
		expect(palettes.secondary).toBe(manual);
		expect(palettes.primary).toBe(sunset);
	});

	it('refuses a seed id the factory does not declare', () => {
		const factory = oneColor();
		// @ts-expect-error 'brnad' is not a seed of this factory
		expect(() => factory.build({ brnad: sunset })).toThrow(expect.objectContaining({ type: 'unknownSeed', cause: { id: 'brnad', declared: ['brand'] } }));
	});

	it('refuses an override for a palette id the factory does not produce', () => {
		const factory = oneColor();
		// @ts-expect-error 'tertiary' is not produced by this factory
		expect(() => factory.build({}, { tertiary: sunset })).toThrow(expect.objectContaining({ type: 'unknownPalette' }));
	});
});

describe('PaletteFactory with a ThemeStyle and a Theme', () => {
	const factory = oneColor();
	const style = new ThemeStyle({
		name: 'demo',
		palettes: factory.build(), // the mandatory defaults are just the factory with its default seeds
		roles: { button: { palette: 'primary', tone: 50 }, soft: { palette: 'secondary', tone: 50 }, background: { palette: 'neutral', tone: 95 } },
	});

	it('its output is what a theme takes: a new seed color moves every palette', () => {
		const theme = new Theme({ style });
		const before = theme.roles().soft.toString();
		theme.setPalettes(factory.build({ brand: sunset }));
		expect(theme.activePalettes().primary).toBe(sunset);
		expect(theme.roles().soft.toString()).not.toBe(before);
	});

	it('a manual override survives the next seed change when it is passed again', () => {
		const theme = new Theme({ style });
		const manual = new TonalPalette('#00ff00', 'manual');
		theme.setPalettes(factory.build({ brand: sunset }, { secondary: manual }));
		expect(theme.activePalettes().secondary).toBe(manual);
	});
});
