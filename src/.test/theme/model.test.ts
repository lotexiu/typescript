import { describe, it, expect } from 'vitest';
import { Theme } from '@ts/theme/model';
import { ThemeStyle } from '@ts/theme/style/model';
import { TonalPalette } from '@ts/theme/palette/model';
import { signal } from '@tsr-node/signal/model';

const palette = (seed: string, name: string) => new TonalPalette(seed, name);
const defaults = () => ({ brand: palette('#1a5fb4', 'brand'), gray: palette('#808080', 'gray') });

const make = (name: string, components = {}) =>
	new ThemeStyle({
		name,
		components,
		palettes: defaults(),
		roles: {
			surface: { palette: 'gray', tone: { dark: 10, light: 95 } },
			brand: { palette: 'brand', tone: { dark: 80, light: 40 } },
			// deliberately weak in light mode (tone 70 on a tone-95 surface) so `enforce` has something to fix
			text: { palette: 'brand', tone: 70, on: 'surface', min: 4.5 },
		},
	});

describe('Theme', () => {
	it('defaults to dark mode, contrast 0 and enforce on', () => {
		const theme = new Theme({ style: make('a') });
		expect(theme.mode()).toBe('dark');
		expect(theme.contrast()).toBe(0);
		expect(theme.enforce()).toBe(true);
	});

	it('uses the given initial settings', () => {
		const style = make('a');
		const theme = new Theme({ style, mode: 'light', contrast: 1, enforce: false });
		expect(theme.mode()).toBe('light');
		expect(theme.contrast()).toBe(1);
		expect(theme.enforce()).toBe(false);
		expect(theme.style()).toBe(style);
	});

	it('exposes the style components, following the style', () => {
		const theme = new Theme({ style: make('a', { radius: 4 }) });
		expect(theme.components()).toEqual({ radius: 4 });
		theme.style.set(make('b', { radius: 9 }));
		expect(theme.components()).toEqual({ radius: 9 });
	});
});

describe('Theme palettes', () => {
	const hex = (theme: Theme<ReturnType<typeof make>>) => theme.roles().brand.toString({ format: 'hex' });

	it('works with no assignment at all: every id uses the style default', () => {
		const style = make('a');
		const theme = new Theme({ style });
		expect(theme.activePalettes().brand).toBe(style.palettes.brand);
		expect(theme.activePalettes().gray).toBe(style.palettes.gray);
	});

	it('an assigned palette replaces the default for that id only', () => {
		const style = make('a');
		const red = palette('#c0392b', 'red');
		const theme = new Theme({ style, palettes: { brand: red } });
		expect(theme.activePalettes().brand).toBe(red);
		expect(theme.activePalettes().gray).toBe(style.palettes.gray);
	});

	it('setPalettes assigns one or several ids, keeps the others and updates the colors', () => {
		const theme = new Theme({ style: make('a') });
		const first = hex(theme);
		const red = palette('#c0392b', 'red');
		theme.setPalettes({ brand: red });
		expect(theme.activePalettes().brand).toBe(red);
		expect(hex(theme)).not.toBe(first);

		const green = palette('#2d6a2d', 'green');
		theme.setPalettes({ gray: green });
		expect(theme.activePalettes().brand).toBe(red);
		expect(theme.activePalettes().gray).toBe(green);
	});

	it('setPalettes with undefined goes back to the style default', () => {
		const style = make('a');
		const theme = new Theme({ style, palettes: { brand: palette('#c0392b', 'red') } });
		theme.setPalettes({ brand: undefined });
		expect(theme.activePalettes().brand).toBe(style.palettes.brand);
	});

	it('setPalettes refuses an id the current style does not declare', () => {
		const theme = new Theme<ThemeStyle>({ style: make('a') });
		expect(() => theme.setPalettes({ accent: palette('#fff000', 'accent') })).toThrow(
			expect.objectContaining({ type: 'undeclaredPalette', cause: { id: 'accent', declared: ['brand', 'gray'] } })
		);
	});

	it('follows a palette whose seed changes, without assigning again', () => {
		const brand = palette('#1a5fb4', 'brand');
		const theme = new Theme({ style: make('a'), palettes: { brand } });
		const first = hex(theme);
		brand.seed.set('#c0392b');
		expect(hex(theme)).not.toBe(first);
	});

	it('switching to a style that declares more palettes falls back to its defaults for the new ids', () => {
		const accent = palette('#ff8800', 'accent');
		const bigger = new ThemeStyle({
			name: 'bigger',
			palettes: { brand: palette('#00aa00', 'other-brand'), gray: palette('#777777', 'other-gray'), accent },
			roles: { glow: { palette: 'accent', tone: 60 }, base: { palette: 'brand', tone: 40 } },
		});
		const red = palette('#c0392b', 'red');
		const theme = new Theme<ThemeStyle>({ style: make('small'), palettes: { brand: red } });

		theme.style.set(bigger);
		expect(theme.activePalettes().brand).toBe(red); // the assignment survives the switch
		expect(theme.activePalettes().gray).toBe(bigger.palettes.gray); // untouched id → the new style's default
		expect(theme.activePalettes().accent).toBe(accent); // new id → default, no error
		expect(() => theme.roles()).not.toThrow();
	});

	it('keeps an assignment made for an id the new style does not declare, in case the first style comes back', () => {
		const small = make('small');
		const other = new ThemeStyle({ name: 'other', palettes: { solo: palette('#123456', 'solo') }, roles: { only: { palette: 'solo', tone: 50 } } });
		const red = palette('#c0392b', 'red');
		const theme = new Theme<ThemeStyle>({ style: small, palettes: { brand: red } });

		theme.style.set(other);
		expect(Object.keys(theme.activePalettes())).toEqual(['solo']);
		theme.style.set(small);
		expect(theme.activePalettes().brand).toBe(red);
	});
});

describe('Theme.roles', () => {
	const hex = (theme: Theme<ThemeStyle>) => theme.roles().brand.toString({ format: 'hex' });

	it('follows the mode', () => {
		const theme = new Theme({ style: make('a') });
		const dark = theme.roles().brand.toString();
		theme.mode.set('light');
		expect(theme.roles().brand.toString()).not.toBe(dark);
	});

	it('follows the style', () => {
		// styles with different roles only fit one theme when it is typed as the general `ThemeStyle`
		const theme = new Theme<ThemeStyle>({ style: make('a') });
		const first = hex(theme);
		theme.style.set(new ThemeStyle({ name: 'b', palettes: defaults(), roles: { brand: { palette: 'brand', tone: 20 }, surface: { palette: 'gray', tone: 5 }, text: { palette: 'gray', tone: 90 } } }));
		expect(hex(theme)).not.toBe(first);
	});
});

describe('Theme.checks / enforce', () => {
	it('reports a failing pair and, with enforce, applies the suggestion', () => {
		const theme = new Theme({ style: make('a'), mode: 'light', enforce: false });
		const [check] = theme.checks();
		expect(check.passed).toBe(false);
		expect(check.suggestion).toBeDefined();
		const authored = theme.roles().text.toString();

		theme.enforce.set(true);
		expect(theme.roles().text.toString()).toBe(check.suggestion!.color.toString());
		expect(theme.roles().text.toString()).not.toBe(authored);
		expect(theme.checks()[0].passed).toBe(false); // checks measure what the style authored
	});
});

describe('Theme.bindStyle / bindPalettes', () => {
	it('bindStyle applies now, follows the source and can be stopped', () => {
		const theme = new Theme({ style: make('a') });
		const source = signal(make('b'));
		const stop = theme.bindStyle(source);
		expect(theme.style().name).toBe('b');
		source.set(make('c'));
		expect(theme.style().name).toBe('c');
		stop();
		source.set(make('d'));
		expect(theme.style().name).toBe('c');
	});

	it('bindPalettes applies now, follows the source and can be stopped', () => {
		const theme = new Theme({ style: make('a') });
		const first = { brand: palette('#c0392b', 'red') };
		const source = signal(first);
		const stop = theme.bindPalettes(source);
		expect(theme.palettes()).toBe(first);
		const second = { brand: palette('#2d6a2d', 'green') };
		source.set(second);
		expect(theme.palettes()).toBe(second);
		stop();
		source.set({ brand: palette('#8b4513', 'brown') });
		expect(theme.palettes()).toBe(second);
	});
});
