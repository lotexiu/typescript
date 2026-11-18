import { describe, it, expect } from 'vitest';
import { Slider } from '@ts/headless/slider/model';
import { SliderUtils } from '@ts/headless/slider/utils';

describe('SliderUtils', () => {
	it('clamps and snaps without floating point drift', () => {
		const range = { min: 0, max: 1, step: 0.1 };
		expect(SliderUtils.normalize(0.30000000000000004, range)).toBe(0.3);
		expect(SliderUtils.normalize(7, range)).toBe(1);
		expect(SliderUtils.normalize(-2, range)).toBe(0);
	});

	it('converts between value and ratio', () => {
		const range = { min: 10, max: 20, step: 1 };
		expect(SliderUtils.ratio(15, range)).toBe(0.5);
		expect(SliderUtils.fromRatio(0.26, range)).toBe(13);
		expect(SliderUtils.ratio(5, { min: 5, max: 5 })).toBe(0);
	});

	it('turns a pointer offset into a ratio, reversed for vertical and right-to-left', () => {
		expect(SliderUtils.pointerRatio(25, 100, 'horizontal', 'ltr')).toBe(0.25);
		expect(SliderUtils.pointerRatio(25, 100, 'horizontal', 'rtl')).toBe(0.75);
		expect(SliderUtils.pointerRatio(25, 100, 'vertical', 'ltr')).toBe(0.75);
		expect(SliderUtils.pointerRatio(500, 100, 'horizontal', 'ltr')).toBe(1);
	});
});

describe('Slider', () => {
	it('fits the initial value into the range and exposes the ratio', () => {
		const volume = new Slider({ min: 0, max: 10, step: 2, value: 13 });
		expect(volume.value()).toBe(10);
		expect(volume.initial).toBe(10);
		expect(volume.ratio()).toBe(1);
	});

	it('follows the keyboard table: arrows, shift, page, home and end', () => {
		const volume = new Slider({ min: 0, max: 100, step: 1, value: 50 });
		volume.keydown({ key: 'ArrowRight' });
		expect(volume.value()).toBe(51);
		volume.keydown({ key: 'ArrowDown' });
		volume.keydown({ key: 'ArrowLeft' });
		expect(volume.value()).toBe(49);
		volume.keydown({ key: 'ArrowUp', shiftKey: true });
		expect(volume.value()).toBe(59);
		volume.keydown({ key: 'PageDown' });
		expect(volume.value()).toBe(49);
		volume.keydown({ key: 'End' });
		expect(volume.value()).toBe(100);
		volume.keydown({ key: 'Home' });
		expect(volume.value()).toBe(0);
		expect(volume.keydown({ key: 'a' })).toBe(false);
	});

	it('swaps the horizontal arrows when the text direction is right-to-left', () => {
		const volume = new Slider({ value: 50, direction: 'rtl' });
		volume.keydown({ key: 'ArrowLeft' });
		expect(volume.value()).toBe(51);
	});

	it('drags only between pointerDown and pointerUp', () => {
		const volume = new Slider({ min: 0, max: 100 });
		expect(volume.pointerMove(50, 100)).toBe(false);
		volume.pointerDown(20, 100);
		expect(volume.value()).toBe(20);
		expect(volume.parts.thumb()['data-dragging']).toBe('');
		volume.pointerMove(80, 100);
		expect(volume.value()).toBe(80);
		volume.pointerUp();
		volume.pointerMove(10, 100);
		expect(volume.value()).toBe(80);
	});

	it('describes the thumb for assistive technology with a formatted text', () => {
		const opacity = new Slider({ min: 0, max: 1, step: 0.1, value: 0.5, format: (value) => `${value * 100}%`, orientation: 'vertical' });
		expect(opacity.parts.thumb()).toMatchObject({
			role: 'slider',
			'aria-valuemin': 0,
			'aria-valuemax': 1,
			'aria-valuenow': 0.5,
			'aria-valuetext': '50%',
			'aria-orientation': 'vertical',
			tabindex: 0,
		});
	});

	it('refuses non numeric writes', () => {
		const volume = new Slider({ value: 5 });
		volume.set(Number.NaN);
		expect(volume.value()).toBe(5);
	});
});
