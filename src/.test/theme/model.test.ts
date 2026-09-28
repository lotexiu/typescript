import { describe, it, expect } from 'vitest';
import { Theme } from '@ts/theme/model';
import { ThemeStyle } from '@ts/theme/style/model';

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
