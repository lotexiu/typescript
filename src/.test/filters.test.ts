import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce, once, step, throttle } from '@ts/filters/implementations';

describe('debounce', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('only calls fn once after the quiet period, with the latest arguments', () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 100);

		debounced('first');
		vi.advanceTimersByTime(50);
		debounced('second');
		vi.advanceTimersByTime(50);
		debounced('third');
		vi.advanceTimersByTime(100);

		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith('third');
	});

	it('clear() cancels a pending call', () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 100);

		debounced();
		debounced.clear();
		vi.advanceTimersByTime(100);

		expect(fn).not.toHaveBeenCalled();
	});
});

describe('throttle', () => {
	it('drops calls made within the interval, keeps calls made after it', () => {
		// Começa num "agora" realista (não em 0) — lastTime interno também
		// começa em 0, e Date.now() real nunca chega perto disso.
		let now = 1_000_000;
		vi.spyOn(Date, 'now').mockImplementation(() => now);

		const fn = vi.fn();
		const throttled = throttle(fn, 100);

		throttled('a');
		now += 50;
		throttled('b');
		now += 60;
		throttled('c');

		expect(fn).toHaveBeenCalledTimes(2);
		expect(fn).toHaveBeenNthCalledWith(1, 'a');
		expect(fn).toHaveBeenNthCalledWith(2, 'c');

		vi.restoreAllMocks();
	});

	it('clear() resets the throttle window', () => {
		let now = 1_000_000;
		vi.spyOn(Date, 'now').mockImplementation(() => now);

		const fn = vi.fn();
		const throttled = throttle(fn, 100);

		throttled();
		throttled.clear();
		now += 1;
		throttled();

		expect(fn).toHaveBeenCalledTimes(2);
		vi.restoreAllMocks();
	});
});

describe('step', () => {
	it('only calls fn every `amount` invocations', () => {
		const fn = vi.fn();
		const stepped = step(fn, 3);

		stepped('a');
		stepped('b');
		stepped('c');

		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith('c');
	});

	it('does not autoClear when autoClear is false', () => {
		const fn = vi.fn();
		const stepped = step(fn, 2, false);

		stepped();
		stepped();
		stepped();

		expect(fn).toHaveBeenCalledTimes(2);
	});
});

describe('once', () => {
	it('only calls fn on the first invocation', () => {
		const fn = vi.fn();
		const onced = once(fn);

		onced('a');
		onced('b');

		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith('a');
	});

	it('clear() allows it to fire again', () => {
		const fn = vi.fn();
		const onced = once(fn);

		onced();
		onced.clear();
		onced();

		expect(fn).toHaveBeenCalledTimes(2);
	});
});
