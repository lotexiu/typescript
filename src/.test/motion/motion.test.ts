import { describe, it, expect } from 'vitest';
import { EasingUtils } from '@ts/motion/easing/utils';
import { Spring } from '@ts/motion/spring/model';
import { SpringUtils } from '@ts/motion/spring/utils';
import { Tween } from '@ts/motion/tween/model';
import { TFrameScheduler } from '@ts/motion/frame/types';

function manualFrames() {
	let pending: ((now: number) => void)[] = [];
	let now = 0;
	const scheduler: TFrameScheduler = (callback) => {
		pending.push(callback);
		return () => {
			pending = pending.filter((candidate) => candidate !== callback);
		};
	};
	const advance = (milliseconds: number) => {
		now += milliseconds;
		const due = pending;
		pending = [];
		due.forEach((callback) => callback(now));
	};
	const runFor = (milliseconds: number, frame = 16) => {
		for (let elapsed = 0; elapsed < milliseconds; elapsed += frame) advance(frame);
	};
	return { scheduler, advance, runFor, pendingCount: () => pending.length };
}

describe('EasingUtils', () => {
	it('keeps the ends fixed and shapes the middle', () => {
		for (const easing of [EasingUtils.linear, EasingUtils.easeIn, EasingUtils.easeOut, EasingUtils.easeInOut]) {
			expect(easing(0)).toBeCloseTo(0);
			expect(easing(1)).toBeCloseTo(1);
		}
		expect(EasingUtils.easeIn(0.5)).toBeLessThan(0.5);
		expect(EasingUtils.easeOut(0.5)).toBeGreaterThan(0.5);
	});

	it('solves a cubic Bézier like CSS does', () => {
		const linear = EasingUtils.cubicBezier(0, 0, 1, 1);
		expect(linear(0.3)).toBeCloseTo(0.3, 4);
		const easeOut = EasingUtils.cubicBezier(0, 0, 0.58, 1);
		expect(easeOut(0.5)).toBeGreaterThan(0.5);
		expect(easeOut(0)).toBe(0);
		expect(easeOut(1)).toBe(1);
	});
});

describe('SpringUtils', () => {
	it('moves towards the target and settles there', () => {
		let state = { value: 0, velocity: 0 };
		for (let frame = 0; frame < 120; frame++) state = SpringUtils.advance(state, 1, {}, 1 / 60);
		expect(SpringUtils.isSettled(state, 1)).toBe(true);
	});

	it('stays stable when a frame arrives very late', () => {
		const state = SpringUtils.advance({ value: 0, velocity: 0 }, 100, { stiffness: 900, damping: 10 }, 2);
		expect(Number.isFinite(state.value)).toBe(true);
		expect(Math.abs(state.value - 100)).toBeLessThan(100);
	});
});

describe('Spring', () => {
	it('animates frame by frame, stops at the target and schedules nothing more', () => {
		const frames = manualFrames();
		const spring = new Spring(0, { scheduler: frames.scheduler });
		spring.set(1);
		expect(spring.moving()).toBe(true);
		frames.runFor(64);
		expect(spring.value()).toBeGreaterThan(0);
		expect(spring.value()).toBeLessThan(1);
		frames.runFor(3000);
		expect(spring.value()).toBe(1);
		expect(spring.moving()).toBe(false);
		expect(frames.pendingCount()).toBe(0);
	});

	it('jumps without animating', () => {
		const frames = manualFrames();
		const spring = new Spring(0, { scheduler: frames.scheduler });
		spring.set(5);
		spring.jump(2);
		expect([spring.value(), spring.target(), spring.moving()]).toEqual([2, 2, false]);
	});
});

describe('Tween', () => {
	it('reaches the target exactly after its duration, following the easing', () => {
		const frames = manualFrames();
		const tween = new Tween(0, { duration: 100, easing: EasingUtils.linear, scheduler: frames.scheduler });
		tween.to(10);
		frames.advance(0);
		frames.advance(50);
		expect(tween.value()).toBeCloseTo(5);
		frames.advance(60);
		expect(tween.value()).toBe(10);
		expect(tween.running()).toBe(false);
	});

	it('starts a new transition from wherever it is', () => {
		const frames = manualFrames();
		const tween = new Tween(0, { duration: 100, easing: EasingUtils.linear, scheduler: frames.scheduler });
		tween.to(10);
		frames.advance(0);
		frames.advance(50);
		tween.to(0);
		frames.advance(0);
		frames.advance(100);
		expect(tween.value()).toBe(0);
	});
});
