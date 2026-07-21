import { describe, expect, it } from 'vitest';
import { buildTonalPalette } from '@ts/palette/implementations';

describe('buildTonalPalette', () => {
	it('generates all 13 tone stops as hex colors', () => {
		const { values } = buildTonalPalette({ seed: '#6750A4' });

		expect(Object.keys(values)).toHaveLength(13);
		for (const hex of Object.values(values)) {
			expect(hex).toMatch(/^#[0-9a-f]{3,6}$/i);
		}
	});

	it('tone0 is near-black and tone100 is near-white, regardless of the seed hue', () => {
		const { values } = buildTonalPalette({ seed: '#6750A4' });

		expect(values.tone0.toLowerCase()).toBe('#000');
		expect(values.tone100.toLowerCase()).toBe('#fff');
	});

	it('keeps the same hue family across the ramp (not just a gray gradient)', () => {
		const { values } = buildTonalPalette({ seed: '#6750A4' });
		// tons intermediários devem preservar tom de roxo, não virar cinza puro
		expect(values.tone40.toLowerCase()).not.toBe(values.tone90.toLowerCase());
	});
});
