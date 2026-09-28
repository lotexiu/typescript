import { describe, it, expect, vi } from 'vitest';
import { ReactiveUtils } from '@tsr/utils';
import { computed } from '@tsr-node/computed/model';
import { signal } from '@tsr-node/signal/model';

// `process` is a Computed wired to its own signal dependencies (not the returned `input`) —
// inputProcess() re-invokes it (pull-based) each time `input` changes, so the test must mutate a
// real signal `process` reads, not a plain closed-over variable, for a recompute to be observable.

describe('ReactiveUtils.inputProcess', () => {
	it('exposes an initial output computed from the initial input', () => {
		const { output } = ReactiveUtils.inputProcess(
			2,
			computed(() => 2 * 10)
		);
		expect(output()).toBe(20);
	});

	it('re-evaluates `process` and updates value/output when input changes, with no debounce', () => {
		const external = signal(2);
		const { input, output } = ReactiveUtils.inputProcess(
			1,
			computed(() => external() * 10)
		);
		external.set(5);
		input.set(2); // triggers the subscribe callback that re-runs process()
		expect(output()).toBe(50);
	});

	it('debounces the value update when a numeric debounce is given', () => {
		vi.useFakeTimers();
		const external = signal(1);
		const { input, output } = ReactiveUtils.inputProcess(
			1,
			computed(() => external() * 10),
			100
		);
		external.set(9);
		input.set(2);
		expect(output()).toBe(10); // not yet applied
		vi.advanceTimersByTime(100);
		expect(output()).toBe(90);
		vi.useRealTimers();
	});

	it('the `value` signal reflects the same data as `output`', () => {
		const { value, output } = ReactiveUtils.inputProcess(
			1,
			computed(() => 1)
		);
		expect(output()).toBe(value());
	});
});
