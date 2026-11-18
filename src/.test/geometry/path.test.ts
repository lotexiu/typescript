import { describe, it, expect } from 'vitest';
import { PathBuilder } from '@ts/geometry/path/model';

describe('PathBuilder', () => {
	it('chains commands into SVG path data with short numbers', () => {
		expect(new PathBuilder().moveTo(0, 0).lineTo(10, 5.12345).quadraticTo(1, 2, 3, 4).close().toString()).toBe('M0 0L10 5.123Q1 2 3 4Z');
		expect(new PathBuilder().arcTo(5, 5, 0, true, false, 10, 0).toString()).toBe('A5 5 0 1 0 10 0');
	});

	it('measures angles from the top, clockwise', () => {
		const center = { x: 50, y: 50 };
		const up = PathBuilder.polar(center, 10, 0);
		const right = PathBuilder.polar(center, 10, 90);
		expect([up.x, up.y]).toEqual([50, 40]);
		expect(right.x).toBeCloseTo(60);
		expect(right.y).toBeCloseTo(50);
	});

	it('builds polygons, rounded rectangles, arcs, slices and stars', () => {
		expect(PathBuilder.polygon([{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 }])).toBe('M0 0L4 0L0 3Z');
		expect(PathBuilder.roundedRect(0, 0, 10, 4, 9)).toContain('A2 2');
		expect(PathBuilder.arc({ x: 0, y: 0 }, 10, 0, 270)).toMatch(/^M0 -10A10 10 0 1 1 /);
		expect(PathBuilder.arc({ x: 0, y: 0 }, 10, 0, 360).match(/A/g)).toHaveLength(2);
		expect(PathBuilder.slice({ x: 0, y: 0 }, 10, 0, 90)).toMatch(/^M0 0L0 -10A.*Z$/);
		expect(PathBuilder.star({ x: 0, y: 0 }, 5, 10, 4).match(/L/g)).toHaveLength(9);
	});
});
