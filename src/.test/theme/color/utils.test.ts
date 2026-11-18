import { describe, it, expect } from 'vitest';
import Color from 'colorjs.io';
import { ColorUtils } from '@ts/theme/color/utils';
import { TonalPalette } from '@ts/theme/palette/model';

describe('ColorUtils', () => {
	it('toHex gamut-maps out-of-sRGB colors instead of returning oklch()', () => {
		const vivid = new TonalPalette('#00f5ff', 'cyan').get(80);
		expect(vivid.inGamut('srgb')).toBe(false);
		expect(ColorUtils.toHex(vivid)).toMatch(/^#[0-9a-f]{3,8}$/);
	});

	it('toHex adds an alpha pair only when alpha < 1', () => {
		const white = new Color('#ffffff');
		expect(ColorUtils.toHex(white)).toBe('#fff');
		expect(ColorUtils.toHex(white, 0.5)).toBe('#ffffff80');
	});

	it('withAlpha does not mutate the original', () => {
		const color = new Color('#336699');
		ColorUtils.withAlpha(color, 0.2);
		expect(color.alpha).toBe(1);
	});

	it('toString converts to the requested format', () => {
		const color = new Color('#336699');
		expect(ColorUtils.toString(color)).toMatch(/^rgb\(/);
		expect(ColorUtils.toString(color, 'hex')).toBe('#369');
		expect(ColorUtils.toString(color, 'oklch')).toMatch(/^oklch\(/);
	});

	it('contrast: black on white is 21', () => {
		expect(ColorUtils.contrast(new Color('#000'), new Color('#fff'))).toBeCloseTo(21, 0);
	});
});
