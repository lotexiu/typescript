import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ticker } from '@ts/composables/ticker/model';
import { computed } from '@tsr-node/computed/model';

describe('ticker', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('counts once per interval while running', () => {
		const clock = ticker(100);
		expect(clock.running()).toBe(false);
		clock.start();
		vi.advanceTimersByTime(350);
		expect(clock.count()).toBe(3);
		clock.stop();
		vi.advanceTimersByTime(500);
		expect(clock.count()).toBe(3);
		expect(clock.running()).toBe(false);
	});

	it('autoStart, reset and a double start do not duplicate timers', () => {
		const clock = ticker(100, { autoStart: true });
		clock.start();
		vi.advanceTimersByTime(200);
		expect(clock.count()).toBe(2);
		clock.reset();
		expect(clock.count()).toBe(0);
		expect(clock.running()).toBe(true);
		clock.dispose();
	});

	it('wakes up a computed that reads count', () => {
		const clock = ticker(10, { autoStart: true });
		const seen: number[] = [];
		const label = computed(() => clock.count() * 2);
		label.subscribe((value) => seen.push(value));
		vi.advanceTimersByTime(30);
		expect(seen).toEqual([2, 4, 6]);
		clock.dispose();
	});
});
