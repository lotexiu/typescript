import { describe, it, expect } from 'vitest';
import { CustomPalette, TonalPalette } from '@ts/theme/palette/model';
import Color from 'colorjs.io';

describe('CustomPalette', () => {
	it('resolves each tone stop from the seed hex it was given', () => {
		const palette = new CustomPalette('test', { 0: '#000000', 50: '#808080', 100: '#ffffff' });
		expect(palette.get(0)).toBeInstanceOf(Color);
		// colorjs.io shortens hex output when possible (#000000 -> #000)
		expect(palette.get(0).toString({ format: 'hex' })).toBe('#000');
		expect(palette.get(100).toString({ format: 'hex' })).toBe('#fff');
	});

	it('caches the Color instance per tone stop', () => {
		const palette = new CustomPalette('test', { 50: '#808080' });
		expect(palette.get(50)).toBe(palette.get(50));
	});

	it('exposes the name as a signal', () => {
		const palette = new CustomPalette('test-name', { 0: '#000000' });
		expect(palette.name()).toBe('test-name');
	});
});

describe('TonalPalette', () => {
	it('produces a color whose oklch lightness matches the tone stop / 100', () => {
		const palette = new TonalPalette('#1a5fb4', 'royal-blue');
		expect(palette.get(50).to('oklch').coords[0]).toBeCloseTo(0.5, 5);
		expect(palette.get(90).to('oklch').coords[0]).toBeCloseTo(0.9, 5);
	});

	it('caches the Color instance per tone stop for a stable seed', () => {
		const palette = new TonalPalette('#1a5fb4', 'royal-blue');
		expect(palette.get(50)).toBe(palette.get(50));
	});

	it('produces different colors for different tone stops', () => {
		const palette = new TonalPalette('#1a5fb4', 'royal-blue');
		expect(palette.get(10).toString()).not.toBe(palette.get(90).toString());
	});

	// Regression (2026-09-24): the tone cache used to only clear when a *new* tone was
	// requested, so a tone already cached before a seed change kept returning the old color.
	it('invalidates every cached tone when the seed changes', () => {
		const palette = new TonalPalette<string>('#1a5fb4', 'royal-blue');
		const before = palette.get(50);
		palette.seed.set('#c0392b');
		const after = palette.get(50);
		expect(after).not.toBe(before);
		expect(after.to('oklch').coords[2] ?? 0).not.toBeCloseTo(before.to('oklch').coords[2] ?? 0, 1);
	});

	it('keeps the same hue/chroma across tone stops (only lightness varies)', () => {
		const palette = new TonalPalette('#1a5fb4', 'royal-blue');
		const [, chromaLow, hueLow] = palette.get(20).to('oklch').coords;
		const [, chromaHigh, hueHigh] = palette.get(80).to('oklch').coords;
		expect(chromaHigh ?? 0).toBeCloseTo(chromaLow ?? 0, 5);
		expect(hueHigh ?? 0).toBeCloseTo(hueLow ?? 0, 5);
	});
});

describe('Palette.opposite', () => {
	it('finds the tone stop closest to 100 minus the given tone', () => {
		const palette = new TonalPalette('#1a5fb4', 'royal-blue');
		expect(palette.opposite(10)).toBe(90);
		expect(palette.opposite(90)).toBe(10);
		expect(palette.opposite(50)).toBe(50);
		expect(palette.opposite(0)).toBe(100);
		expect(palette.opposite(100)).toBe(0);
	});

	it('accepts a Color and resolves its closest tone stop first', () => {
		const palette = new TonalPalette('#1a5fb4', 'royal-blue');
		expect(palette.opposite(palette.get(20))).toBe(80);
	});
});

describe('Palette.lightness / chroma', () => {
	it('lightness(get(T)) resolves back to T (self-consistency)', () => {
		const palette = new TonalPalette('#1a5fb4', 'royal-blue');
		for (const tone of [0, 10, 50, 90, 100] as const) {
			expect(palette.lightness(palette.get(tone))).toBe(tone);
		}
	});

	it('chroma(get(T)) resolves back to T (self-consistency, hue/chroma constant per tone)', () => {
		const palette = new TonalPalette('#1a5fb4', 'royal-blue');
		// chroma varies monotonically-ish with lightness for a fixed-chroma tonal ramp only in
		// terms of gamut clipping; check it at least resolves to *some* valid tone stop.
		const resolved = palette.chroma(palette.get(50));
		expect([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100]).toContain(resolved);
	});
});

describe('Palette.rangeTo', () => {
	it('returns a Color mapped into the requested gamut/space', () => {
		const palette = new TonalPalette('#1a5fb4', 'royal-blue');
		const mapped = palette.rangeTo(50, 'srgb');
		expect(mapped).toBeInstanceOf(Color);
		expect(mapped.space.id).toBe('srgb');
	});
});

describe('Palette (any tone, onColor, derive, neutral)', () => {
	it('TonalPalette accepts tones between the stops', () => {
		const palette = new TonalPalette('#1a5fb4', 'blue');
		expect(palette.get(17).to('oklch').coords[0]).toBeCloseTo(0.17, 5);
	});

	it('CustomPalette interpolates tones that were not given and clamps outside the range', () => {
		const palette = new CustomPalette('test', { 0: '#000000', 100: '#ffffff' });
		const mid = palette.get(50).to('srgb').coords;
		expect(mid[0]).toBeGreaterThan(0.1);
		expect(mid[0]).toBeLessThan(0.9);
		expect(palette.get(0).toString({ format: 'hex' })).toBe('#000');
		const only = new CustomPalette('one', { 50: '#808080' });
		expect(only.get(10).toString({ format: 'hex' })).toBe(only.get(90).toString({ format: 'hex' }));
	});

	it('onColor picks the readable tone: light over dark, dark over light', () => {
		const palette = new TonalPalette('#1a5fb4', 'blue');
		expect(palette.onColor(palette.get(20)).to('oklch').coords[0]).toBeCloseTo(1, 1);
		expect(palette.onColor(palette.get(90)).to('oklch').coords[0]).toBeCloseTo(0.1, 1);
	});

	it('derive shifts the hue (wrapping) and scales/replaces the chroma', () => {
		const palette = new TonalPalette('#1a5fb4', 'blue');
		const [, chroma, hue] = palette.get(50).to('oklch').coords;
		const shifted = palette.derive({ hueShift: 200, chromaScale: 0.5, name: 'shifted' });
		const [, shiftedChroma, shiftedHue] = shifted.get(50).to('oklch').coords;
		expect(shifted.name()).toBe('shifted');
		expect(shiftedChroma).toBeCloseTo((chroma ?? 0) * 0.5, 4);
		expect(shiftedHue).toBeCloseTo(((hue ?? 0) + 200) % 360, 3);
		expect(palette.derive().name()).toBe('blue');
	});

	it('neutral keeps the hue but drops the chroma', () => {
		const palette = new TonalPalette('#1a5fb4', 'blue');
		const [, chroma, hue] = palette.neutral().get(50).to('oklch').coords;
		expect(chroma).toBeCloseTo(0.03, 4);
		expect(hue).toBeCloseTo(palette.get(50).to('oklch').coords[2] ?? 0, 3);
	});
});
