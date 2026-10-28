import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ticker } from '@ts/composables/ticker/model';
import { computed } from '@tsr-node/computed/model';

describe('ticker', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('counts once per interval while running', () => {
		const t = ticker(100);
		expect(t.running()).toBe(false);
		t.start();
		vi.advanceTimersByTime(350);
		expect(t.count()).toBe(3);
		t.stop();
		vi.advanceTimersByTime(500);
		expect(t.count()).toBe(3);
		expect(t.running()).toBe(false);
	});

	it('autoStart, reset and a double start do not duplicate timers', () => {
		const t = ticker(100, { autoStart: true });
		t.start();
		vi.advanceTimersByTime(200);
		expect(t.count()).toBe(2);
		t.reset();
		expect(t.count()).toBe(0);
		expect(t.running()).toBe(true);
		t.dispose();
	});

	it('wakes up a computed that reads count', () => {
		const t = ticker(10, { autoStart: true });
		const seen: number[] = [];
		const label = computed(() => t.count() * 2);
		label.subscribe((v) => seen.push(v));
		vi.advanceTimersByTime(30);
		expect(seen).toEqual([2, 4, 6]);
		t.dispose();
	});
});
