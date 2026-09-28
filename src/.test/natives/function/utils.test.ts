import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FunctionUtils } from '@tsn-function/utils';

describe('FunctionUtils.thisAsParameter', () => {
	it('passes the calling `this` as the first explicit argument', () => {
		const fn = FunctionUtils.thisAsParameter(function (self: any, a: number, b: number) {
			return [self, a, b];
		});
		const ctx = { tag: 'ctx' };
		expect(fn.call(ctx, 1, 2)).toEqual([ctx, 1, 2]);
	});
});

describe('FunctionUtils.rebind', () => {
	it('pre-applies leading arguments and binds `this`', () => {
		function greet(this: { name: string }, greeting: string, punctuation: string) {
			return `${greeting}, ${this.name}${punctuation}`;
		}
		const bound = FunctionUtils.rebind(greet, { name: 'Ada' }, 'Hello');
		expect(bound('!')).toBe('Hello, Ada!');
	});

	it('tracks the original function via `origin`', () => {
		function original() {}
		const rebound = FunctionUtils.rebind(original, null);
		expect(rebound.origin).toBe(original);
	});
});

describe('FunctionUtils.debounce', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('only calls fn once after calls stop for `delay` ms, with the latest args', () => {
		const fn = vi.fn();
		const debounced = FunctionUtils.debounce(fn, 100);
		debounced('a');
		vi.advanceTimersByTime(50);
		debounced('b');
		vi.advanceTimersByTime(50);
		expect(fn).not.toHaveBeenCalled();
		vi.advanceTimersByTime(50);
		expect(fn).toHaveBeenCalledOnce();
		expect(fn).toHaveBeenCalledWith('b');
	});

	it('calls fn synchronously when the resolved delay is 0', () => {
		const fn = vi.fn();
		const debounced = FunctionUtils.debounce(fn, () => 0);
		debounced('x');
		expect(fn).toHaveBeenCalledWith('x');
	});

	it('clear() cancels a pending call', () => {
		const fn = vi.fn();
		const debounced = FunctionUtils.debounce(fn, 100);
		debounced('a');
		debounced.clear();
		vi.advanceTimersByTime(200);
		expect(fn).not.toHaveBeenCalled();
	});

	it('supports a dynamic delay function evaluated on each call', () => {
		const fn = vi.fn();
		let delay = 100;
		const debounced = FunctionUtils.debounce(fn, () => delay);
		debounced('a');
		delay = 10;
		vi.advanceTimersByTime(100);
		expect(fn).toHaveBeenCalledWith('a');
	});
});

describe('FunctionUtils.leadingDebounce', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('calls fn immediately on the first call', () => {
		const fn = vi.fn();
		const debounced = FunctionUtils.leadingDebounce(fn, 100);
		debounced('a');
		expect(fn).toHaveBeenCalledWith('a');
	});

	it('ignores calls within the window after the leading call', () => {
		const fn = vi.fn();
		const debounced = FunctionUtils.leadingDebounce(fn, 100);
		debounced('a');
		debounced('b');
		vi.advanceTimersByTime(99);
		debounced('c');
		expect(fn).toHaveBeenCalledOnce();
	});

	it('allows a new leading call once the window has passed', () => {
		const fn = vi.fn();
		const debounced = FunctionUtils.leadingDebounce(fn, 100);
		debounced('a');
		vi.advanceTimersByTime(100);
		debounced('b');
		expect(fn).toHaveBeenCalledTimes(2);
		expect(fn).toHaveBeenLastCalledWith('b');
	});
});

describe('FunctionUtils.throttle', () => {
	it('calls fn immediately on the first call', () => {
		const fn = vi.fn();
		const throttled = FunctionUtils.throttle(fn, 100);
		throttled('a');
		expect(fn).toHaveBeenCalledWith('a');
	});

	it('ignores calls within the interval after the last accepted call', () => {
		vi.useFakeTimers();
		const fn = vi.fn();
		const throttled = FunctionUtils.throttle(fn, 100);
		throttled('a');
		vi.advanceTimersByTime(50);
		throttled('b');
		expect(fn).toHaveBeenCalledOnce();
		vi.useRealTimers();
	});

	it('accepts a call again once the interval has elapsed', () => {
		vi.useFakeTimers();
		const fn = vi.fn();
		const throttled = FunctionUtils.throttle(fn, 100);
		throttled('a');
		vi.advanceTimersByTime(100);
		throttled('b');
		expect(fn).toHaveBeenCalledTimes(2);
		vi.useRealTimers();
	});

	it('clear() resets the throttle window', () => {
		vi.useFakeTimers();
		const fn = vi.fn();
		const throttled = FunctionUtils.throttle(fn, 100);
		throttled('a');
		throttled.clear();
		throttled('b');
		expect(fn).toHaveBeenCalledTimes(2);
		vi.useRealTimers();
	});
});

describe('FunctionUtils.step', () => {
	it('only calls fn on the Nth call', () => {
		const fn = vi.fn();
		const stepped = FunctionUtils.step(fn, 3);
		stepped();
		stepped();
		expect(fn).not.toHaveBeenCalled();
		stepped();
		expect(fn).toHaveBeenCalledOnce();
	});

	it('resets the counter after firing when autoClear is true (default)', () => {
		const fn = vi.fn();
		const stepped = FunctionUtils.step(fn, 2);
		stepped();
		stepped();
		stepped();
		expect(fn).toHaveBeenCalledOnce();
		stepped();
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('does not reset the counter when autoClear is false, firing on every call once threshold is reached', () => {
		const fn = vi.fn();
		const stepped = FunctionUtils.step(fn, 2, false);
		stepped();
		stepped();
		expect(fn).toHaveBeenCalledTimes(1);
		stepped();
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('clear() resets the counter manually', () => {
		const fn = vi.fn();
		const stepped = FunctionUtils.step(fn, 2);
		stepped();
		stepped.clear();
		stepped();
		expect(fn).not.toHaveBeenCalled();
	});
});

describe('FunctionUtils.once', () => {
	it('calls fn on the first call and ignores the rest', () => {
		const fn = vi.fn();
		const onced = FunctionUtils.once(fn);
		onced('a');
		onced('b');
		expect(fn).toHaveBeenCalledOnce();
		expect(fn).toHaveBeenCalledWith('a');
	});

	it('clear() allows fn to run again', () => {
		const fn = vi.fn();
		const onced = FunctionUtils.once(fn);
		onced();
		onced.clear();
		onced();
		expect(fn).toHaveBeenCalledTimes(2);
	});
});

describe('FunctionUtils.memoize', () => {
	it('caches the result per JSON-stringified args by default', () => {
		const fn = vi.fn((a: number, b: number) => a + b);
		const memoized = FunctionUtils.memoize(fn);
		expect(memoized(1, 2)).toBe(3);
		expect(memoized(1, 2)).toBe(3);
		expect(fn).toHaveBeenCalledOnce();
	});

	it('recomputes for different arguments', () => {
		const fn = vi.fn((a: number, b: number) => a + b);
		const memoized = FunctionUtils.memoize(fn);
		memoized(1, 2);
		memoized(2, 3);
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('uses a custom key resolver when given', () => {
		const fn = vi.fn((obj: { id: number; name: string }) => obj.name);
		const memoized = FunctionUtils.memoize(fn, (obj) => String(obj.id));
		memoized({ id: 1, name: 'a' });
		memoized({ id: 1, name: 'b' });
		expect(fn).toHaveBeenCalledOnce();
	});

	it('exposes the underlying cache', () => {
		const memoized = FunctionUtils.memoize((a: number) => a * 2);
		memoized(5);
		expect(memoized.cache.get('[5]')).toBe(10);
	});
});

describe('FunctionUtils.curry', () => {
	it('collects arguments until fn.length is reached, then invokes', () => {
		const add3 = (a: number, b: number, c: number) => a + b + c;
		const curried = FunctionUtils.curry(add3);
		expect((curried as any)(1)(2)(3)).toBe(6);
	});

	it('invokes immediately when called with all args at once', () => {
		const add = (a: number, b: number) => a + b;
		const curried = FunctionUtils.curry(add);
		expect((curried as any)(1, 2)).toBe(3);
	});

	it('supports partial application in a single extra call', () => {
		const add3 = (a: number, b: number, c: number) => a + b + c;
		const curried = FunctionUtils.curry(add3);
		expect((curried as any)(1, 2)(3)).toBe(6);
	});
});

describe('FunctionUtils.scheduleOnce', () => {
	it('coalesces multiple calls within the same microtask into a single run', async () => {
		const fn = vi.fn();
		const scheduled = FunctionUtils.scheduleOnce(fn);
		scheduled();
		scheduled();
		scheduled();
		expect(fn).not.toHaveBeenCalled();
		await Promise.resolve();
		await Promise.resolve();
		expect(fn).toHaveBeenCalledOnce();
	});

	it('clear() cancels a pending run', async () => {
		const fn = vi.fn();
		const scheduled = FunctionUtils.scheduleOnce(fn);
		scheduled();
		scheduled.clear();
		await Promise.resolve();
		await Promise.resolve();
		expect(fn).not.toHaveBeenCalled();
	});

	it('flush() runs a pending call immediately', () => {
		const fn = vi.fn();
		const scheduled = FunctionUtils.scheduleOnce(fn);
		scheduled();
		scheduled.flush();
		expect(fn).toHaveBeenCalledOnce();
	});

	it('flush() is a no-op when nothing is scheduled', () => {
		const fn = vi.fn();
		const scheduled = FunctionUtils.scheduleOnce(fn);
		scheduled.flush();
		expect(fn).not.toHaveBeenCalled();
	});

	it('allows scheduling again after a run completes', async () => {
		const fn = vi.fn();
		const scheduled = FunctionUtils.scheduleOnce(fn);
		scheduled();
		await Promise.resolve();
		await Promise.resolve();
		scheduled();
		await Promise.resolve();
		await Promise.resolve();
		expect(fn).toHaveBeenCalledTimes(2);
	});
});
