import { describe, it, expect, vi } from 'vitest';
import { debouncedValue, DebouncedValue } from '@tsr/debounced-value/model';
import { Signal, signal } from '@tsr-node/signal/model';

describe('debouncedValue', () => {
	it('starts both the signal and `debounced` at the initial value', () => {
		const dv = debouncedValue('a', 100);
		expect(dv()).toBe('a');
		expect(dv.debounced()).toBe('a');
	});

	it('updates the signal immediately but leaves `debounced` unchanged until the delay elapses', () => {
		vi.useFakeTimers();
		const dv = debouncedValue('a', 100);
		dv.set('ab');
		expect(dv()).toBe('ab');
		expect(dv.debounced()).toBe('a');
		vi.advanceTimersByTime(100);
		expect(dv.debounced()).toBe('ab');
		vi.useRealTimers();
	});

	it('only commits the latest value after rapid successive sets (each set reschedules the delay)', () => {
		vi.useFakeTimers();
		const dv = debouncedValue('a', 100);
		dv.set('ab');
		vi.advanceTimersByTime(50);
		dv.set('abc');
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
		dv.set('ab');
		vi.advanceTimersByTime(50);
		expect(dv.debounced()).toBe('ab');
		vi.useRealTimers();
	});
});

describe('debouncedValue shape', () => {
	it('is itself a Signal with `debounced` attached, recognised by instanceof DebouncedValue', () => {
		const dv = debouncedValue('a', 0);
		expect(dv instanceof Signal).toBe(true);
		expect(dv instanceof DebouncedValue).toBe(true);
		expect(signal('a') instanceof DebouncedValue).toBe(false);
	});
});
