import { describe, it, expect } from 'vitest';
import { Theme } from '@ts/theme/model';
import { ThemeStyle } from '@ts/theme/style/model';
import { TonalPalette } from '@ts/theme/palette/model';
import { signal } from '@tsr-node/signal/model';

describe('Theme', () => {
	it('defaults to dark mode when no mode is given', () => {
		const style = new ThemeStyle('s', {}, {});
		const theme = new Theme(style);
		expect(theme.mode()).toBe('dark');
	});

	it('uses the given initial mode/style', () => {
		const style = new ThemeStyle('s', {}, {});
		const theme = new Theme(style, 'light');
		expect(theme.mode()).toBe('light');
		expect(theme.style()).toBe(style);
	});

	it('mode/style are independent, writable signals', () => {
		const styleA = new ThemeStyle('a', {}, {});
		const styleB = new ThemeStyle('b', {}, {});
		const theme = new Theme(styleA, 'dark');
		theme.mode.set('light');
		theme.style.set(styleB);
		expect(theme.mode()).toBe('light');
		expect(theme.style()).toBe(styleB);
	});
});

describe('Theme.roles / bindStyle', () => {
	const make = (name: string, seed: string) => new ThemeStyle(name, { primary: new TonalPalette(seed, name) }, {});

	it('roles follow the mode', () => {
		const theme = new Theme(make('a', '#1a5fb4'), 'dark');
		const dark = theme.roles().primary.main;
		theme.mode.set('light');
		expect(theme.roles().primary.main).not.toBe(dark);
	});

	it('roles follow the style', () => {
		const theme = new Theme(make('a', '#1a5fb4'));
		const first = theme.roles().primary.main.toString({ format: 'hex' });
		theme.style.set(make('b', '#c0392b'));
		expect(theme.roles().primary.main.toString({ format: 'hex' })).not.toBe(first);
	});

	it('bindStyle applies now, follows the source and can be stopped', () => {
		const theme = new Theme(make('a', '#1a5fb4'));
		const source = signal(make('b', '#c0392b'));
		const stop = theme.bindStyle(source);
		expect(theme.style().name).toBe('b');
		source.set(make('c', '#2d6a2d'));
		expect(theme.style().name).toBe('c');
		stop();
		source.set(make('d', '#8b4513'));
		expect(theme.style().name).toBe('c');
	});

	it('forwards role schemes', () => {
		const theme = new Theme(make('a', '#1a5fb4'), 'dark', { primary: { extra: { dark: 50, light: 50 } } });
		expect(theme.roles().primary.extra).toBeDefined();
	});
});
