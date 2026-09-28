import { describe, it, expect, vi } from 'vitest';
import { debouncedValue } from '@ts/composables/debounced-value/model';
import { signal } from '@tsr-node/signal/model';

describe('debouncedValue', () => {
	it('starts both `value` and `debounced` at the initial value', () => {
		const dv = debouncedValue('a', 100);
		expect(dv.value()).toBe('a');
		expect(dv.debounced()).toBe('a');
	});

	it('updates `value` immediately but leaves `debounced` unchanged until the delay elapses', () => {
		vi.useFakeTimers();
		const dv = debouncedValue('a', 100);
		dv.value.set('ab');
		expect(dv.value()).toBe('ab');
		expect(dv.debounced()).toBe('a');
		vi.advanceTimersByTime(100);
		expect(dv.debounced()).toBe('ab');
		vi.useRealTimers();
	});

	it('only commits the latest value after rapid successive sets (each set reschedules the delay)', () => {
		vi.useFakeTimers();
		const dv = debouncedValue('a', 100);
		dv.value.set('ab');
		vi.advanceTimersByTime(50);
		dv.value.set('abc');
		vi.advanceTimersByTime(50);
		expect(dv.debounced()).toBe('a'); // still not settled, the second set reset the timer
		vi.advanceTimersByTime(50);
		expect(dv.debounced()).toBe('abc');
		vi.useRealTimers();
	});

	it('accepts a reactive delay', () => {
		vi.useFakeTimers();
		const delay = signal(50);
		const dv = debouncedValue('a', delay);
		dv.value.set('ab');
		vi.advanceTimersByTime(50);
		expect(dv.debounced()).toBe('ab');
		vi.useRealTimers();
	});
});
