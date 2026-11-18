import { describe, it, expect } from 'vitest';
import { PositionUtils } from '@ts/headless/position/utils';

const viewport = { x: 0, y: 0, width: 1000, height: 800 };
const anchor = { x: 400, y: 300, width: 100, height: 40 };
const floating = { width: 200, height: 120 };

describe('PositionUtils.compute', () => {
	it('places on each side with the requested alignment and offset', () => {
		expect(PositionUtils.compute(anchor, floating, viewport, { placement: 'bottom', offset: 8 })).toMatchObject({ x: 350, y: 348, side: 'bottom' });
		expect(PositionUtils.compute(anchor, floating, viewport, { placement: 'bottom-start' })).toMatchObject({ x: 400, y: 340 });
		expect(PositionUtils.compute(anchor, floating, viewport, { placement: 'bottom-end' })).toMatchObject({ x: 300 });
		expect(PositionUtils.compute(anchor, floating, viewport, { placement: 'top' })).toMatchObject({ y: 180, side: 'top' });
		expect(PositionUtils.compute(anchor, floating, viewport, { placement: 'right-start' })).toMatchObject({ x: 500, y: 300 });
		expect(PositionUtils.compute(anchor, floating, viewport, { placement: 'left' })).toMatchObject({ x: 200, y: 260 });
	});

	it('flips to the opposite side when the preferred one has no room', () => {
		const nearBottom = { ...anchor, y: 740 };
		const result = PositionUtils.compute(nearBottom, floating, viewport, { placement: 'bottom-start' });
		expect(result).toMatchObject({ side: 'top', placement: 'top-start', y: 620 });
		expect(PositionUtils.compute(nearBottom, floating, viewport, { placement: 'bottom', flip: false }).side).toBe('bottom');
	});

	it('shifts along the side to stay inside the boundary, keeping the padding', () => {
		const nearLeft = { ...anchor, x: 10 };
		expect(PositionUtils.compute(nearLeft, floating, viewport, { placement: 'bottom', padding: 8 }).x).toBe(8);
		expect(PositionUtils.compute(nearLeft, floating, viewport, { placement: 'bottom', shift: false }).x).toBe(-40);
	});

	it('points the arrow at the anchor center and reports the room left', () => {
		const nearLeft = { ...anchor, x: 10 };
		const result = PositionUtils.compute(nearLeft, floating, viewport, { placement: 'bottom', arrowSize: 10 });
		expect(result.arrow).toBe(55);
		expect(result.available).toBe(800 - 340);
	});
});
