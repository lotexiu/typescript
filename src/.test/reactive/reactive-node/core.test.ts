import { describe, it, expect, vi } from 'vitest';
import { signal, Signal } from '@tsr-node/signal/model';
import { computed, Computed } from '@tsr-node/computed/model';

describe('signal', () => {
	it('reads back the initial value', () => {
		const s = signal(1);
		expect(s()).toBe(1);
	});

	it('set() updates the value and returns true when it changed', () => {
		const s = signal(1);
		expect(s.set(2)).toBe(true);
		expect(s()).toBe(2);
	});

	it('set() returns false and does not notify when the value is unchanged (Object.is)', () => {
		const s = signal(1);
		const listener = vi.fn();
		s.subscribe(listener);
		expect(s.set(1)).toBe(false);
		expect(listener).not.toHaveBeenCalled();
	});

	it('update() derives the next value from the current one', () => {
		const s = signal(5);
		s.update((v) => v + 1);
		expect(s()).toBe(6);
	});

	it('supports a custom equality function', () => {
		const s = signal({ id: 1 }, (a, b) => a.id === b.id);
		const listener = vi.fn();
		s.subscribe(listener);
		s.set({ id: 1 });
		expect(listener).not.toHaveBeenCalled();
		s.set({ id: 2 });
		expect(listener).toHaveBeenCalledOnce();
	});

	it('notify() re-emits without changing the value, for in-place mutation', () => {
		const s = signal({ items: [] as number[] });
		const listener = vi.fn();
		s.subscribe(listener);
		s().items.push(1);
		s.notify();
		expect(listener).toHaveBeenCalledOnce();
		expect(listener).toHaveBeenCalledWith(s());
	});

	it('is recognized by `instanceof Signal`', () => {
		const s = signal(1);
		expect(s instanceof Signal).toBe(true);
		expect(computed(() => 1) instanceof Signal).toBe(false);
	});
});

describe('signal.subscribe', () => {
	it('calls the listener with the new value on change', () => {
		const s = signal(1);
		const listener = vi.fn();
		s.subscribe(listener);
		s.set(2);
		expect(listener).toHaveBeenCalledWith(2);
	});

	it('does not call the listener immediately on subscribe', () => {
		const s = signal(1);
		const listener = vi.fn();
		s.subscribe(listener);
		expect(listener).not.toHaveBeenCalled();
	});

	it('the returned unsubscribe function stops further notifications', () => {
		const s = signal(1);
		const listener = vi.fn();
		const unsubscribe = s.subscribe(listener);
		unsubscribe();
		s.set(2);
		expect(listener).not.toHaveBeenCalled();
	});

	it('calling unsubscribe twice is a no-op', () => {
		const s = signal(1);
		const listener = vi.fn();
		const unsubscribe = s.subscribe(listener);
		unsubscribe();
		expect(() => unsubscribe()).not.toThrow();
	});

	it('an error in one listener does not stop other listeners from running', () => {
		const s = signal(1);
		const good = vi.fn();
		s.subscribe(() => {
			throw new Error('boom');
		});
		s.subscribe(good);
		expect(() => s.set(2)).toThrow();
		expect(good).toHaveBeenCalled();
	});

	it('dispose() clears listeners so they no longer fire', () => {
		const s = signal(1);
		const listener = vi.fn();
		s.subscribe(listener);
		s.dispose();
		s.set(2);
		expect(listener).not.toHaveBeenCalled();
	});
});

describe('computed', () => {
	it('derives its value from the signals it reads', () => {
		const a = signal(2);
		const b = signal(3);
		const sum = computed(() => a() + b());
		expect(sum()).toBe(5);
	});

	it('recomputes lazily when a dependency changes', () => {
		const a = signal(2);
		const compute = vi.fn(() => a() * 2);
		const doubled = computed(compute);
		expect(doubled()).toBe(4);
		expect(compute).toHaveBeenCalledOnce();
		a.set(3);
		expect(compute).toHaveBeenCalledOnce(); // not recomputed until read again
		expect(doubled()).toBe(6);
		expect(compute).toHaveBeenCalledTimes(2);
	});

	it('does not recompute when read again with no dependency change', () => {
		const a = signal(2);
		const compute = vi.fn(() => a() * 2);
		const doubled = computed(compute);
		doubled();
		doubled();
		doubled();
		expect(compute).toHaveBeenCalledOnce();
	});

	it('tracks dependencies dynamically (conditional reads)', () => {
		const cond = signal(true);
		const a = signal('a');
		const b = signal('b');
		const compute = vi.fn(() => (cond() ? a() : b()));
		const result = computed(compute);
		expect(result()).toBe('a');
		b.set('b2');
		expect(result()).toBe('a'); // b is not a dependency yet, no recompute forced
		cond.set(false);
		expect(result()).toBe('b2');
	});

	it('supports chains of computed values', () => {
		const a = signal(1);
		const doubled = computed(() => a() * 2);
		const quadrupled = computed(() => doubled() * 2);
		expect(quadrupled()).toBe(4);
		a.set(2);
		expect(quadrupled()).toBe(8);
	});

	it('throws a cycle error when a computed reads itself', () => {
		let self: () => number;
		const c = computed((): number => self());
		self = c;
		// LocaleError's message text is locale-dependent — assert only that it throws.
		expect(() => c()).toThrow();
	});

	it('throws when writing to a signal during a compute', () => {
		const a = signal(1);
		const b = signal(2);
		const bad = computed(() => {
			b.set(99);
			return a();
		});
		expect(() => bad()).toThrow();
	});

	it('is recognized by `instanceof Computed` and not confused with a Signal', () => {
		const c = computed(() => 1);
		expect(c instanceof Computed).toBe(true);
		expect(signal(1) instanceof Computed).toBe(false);
	});

	it('subscribe() only fires when the computed value actually changes', () => {
		const a = signal(1);
		const isEven = computed(() => a() % 2 === 0);
		const listener = vi.fn();
		isEven.subscribe(listener);
		a.set(3); // still odd -> value unchanged
		expect(listener).not.toHaveBeenCalled();
		a.set(4); // now even -> value changed
		expect(listener).toHaveBeenCalledWith(true);
	});

	it('subscribing triggers an initial compute so version tracking is correct on first change', () => {
		const a = signal(1);
		const compute = vi.fn(() => a());
		const c = computed(compute);
		c.subscribe(() => {});
		expect(compute).toHaveBeenCalledOnce();
		a.set(2);
		expect(compute).toHaveBeenCalledTimes(2);
	});
});

describe('Signal.untracked', () => {
	it('reads inside untracked do not register as dependencies', () => {
		const a = signal(1);
		const b = signal(2);
		const compute = vi.fn(() => a() + Signal.untracked(() => b()));
		const sum = computed(compute);
		expect(sum()).toBe(3);
		b.set(10);
		expect(sum()).toBe(3); // b change doesn't invalidate, still returns cached value
		a.set(5);
		expect(sum()).toBe(15); // recomputed because `a` changed, now reads new `b` too
	});
});

describe('Signal.batch', () => {
	it('coalesces multiple writes into a single round of notifications', () => {
		const a = signal(1);
		const b = signal(2);
		const listener = vi.fn();
		const sum = computed(() => a() + b());
		sum.subscribe(listener);
		Signal.batch(() => {
			a.set(10);
			b.set(20);
		});
		expect(listener).toHaveBeenCalledOnce();
		expect(listener).toHaveBeenCalledWith(30);
	});

	it('does not run listeners until the outermost batch finishes', () => {
		const a = signal(1);
		const listener = vi.fn();
		a.subscribe(listener);
		Signal.batch(() => {
			Signal.batch(() => {
				a.set(2);
			});
			expect(listener).not.toHaveBeenCalled();
		});
		expect(listener).toHaveBeenCalledOnce();
	});
});
