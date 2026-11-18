import { describe, it, expect } from 'vitest';
import { PALETTES_TYPES } from '@ts/theme/palette/presets';
import { TonalPalette } from '@ts/theme/palette/model';

describe('PALETTES presets', () => {
	it('every preset group is a non-empty array of TonalPalette instances', () => {
		for (const group of Object.values(PALETTES_TYPES)) {
			const palettes: TonalPalette[]  = Object.values(group)
			expect(palettes.length).toBeGreaterThan(0);
			for (const palette of palettes) {
				expect(palette).toBeInstanceOf(TonalPalette);
			}
		}
	});

	it('every preset resolves every tone stop without throwing', () => {
		for (const group of Object.values(PALETTES_TYPES)) {
			const palettes: TonalPalette[]  = Object.values(group)
			for (const palette of palettes) {
				for (const tone of [0, 10, 50, 90, 100] as const) {
					expect(() => palette.get(tone)).not.toThrow();
				}
			} 
		}
	});
});
