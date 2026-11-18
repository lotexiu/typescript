import { describe, it, expect } from 'vitest';
import { ValueNoise } from '@ts/noise/model';

describe('ValueNoise', () => {
	it('is deterministic per seed and stays inside [0, 1]', () => {
		const first = new ValueNoise(7);
		const second = new ValueNoise(7);
		const other = new ValueNoise(8);
		const samples = [0.3, 1.7, 12.25, -3.5].map((coordinate) => first.at(coordinate, coordinate * 0.5));
		expect(samples).toEqual([0.3, 1.7, 12.25, -3.5].map((coordinate) => second.at(coordinate, coordinate * 0.5)));
		expect(samples).not.toEqual([0.3, 1.7, 12.25, -3.5].map((coordinate) => other.at(coordinate, coordinate * 0.5)));
		for (const value of samples) expect(value).toBeGreaterThanOrEqual(0);
		for (const value of samples) expect(value).toBeLessThanOrEqual(1);
	});

	it('changes smoothly between neighbouring points', () => {
		const noise = new ValueNoise(1);
		expect(Math.abs(noise.at(2.5, 3.5) - noise.at(2.501, 3.5))).toBeLessThan(0.01);
	});

	it('keeps fractal noise inside [0, 1]', () => {
		const noise = new ValueNoise(3);
		for (let index = 0; index < 50; index++) {
			const value = noise.fractal(index * 0.37, index * 0.11, { octaves: 5 });
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThanOrEqual(1);
		}
	});
});
