import { describe, it, expect } from 'vitest';
import { PALETTES } from '@ts/theme/palette/presets';
import { TonalPalette } from '@ts/theme/palette/model';

describe('PALETTES presets', () => {
	it('every preset group is a non-empty array of TonalPalette instances', () => {
		for (const group of Object.values(PALETTES)) {
			expect(group.length).toBeGreaterThan(0);
			for (const palette of group) {
				expect(palette).toBeInstanceOf(TonalPalette);
			}
		}
	});

	it('every preset resolves every tone stop without throwing', () => {
		for (const group of Object.values(PALETTES)) {
			for (const palette of group) {
				for (const tone of [0, 10, 50, 90, 100] as const) {
					expect(() => palette.get(tone)).not.toThrow();
				}
			}
		}
	});

	it('preset names are unique within each group', () => {
		for (const group of Object.values(PALETTES)) {
			const names = group.map((p) => p.name());
			expect(new Set(names).size).toBe(names.length);
		}
	});
});
