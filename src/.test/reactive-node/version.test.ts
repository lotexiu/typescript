import { describe, it, expect } from 'vitest';
import { computed } from '@tsr-node/computed/model';
import { signal } from '@tsr-node/signal/model';

describe('version()', () => {
	it('a signal bumps only on real changes', () => {
		const counter = signal(1);
		const v0 = counter.version();
		counter.set(1);
		expect(counter.version()).toBe(v0);
		counter.set(2);
		expect(counter.version()).toBe(v0 + 1);
	});

	it('notify() bumps even though the reference is the same (in-place mutation)', () => {
		const state = signal({ n: 1 });
		const v0 = state.version();
		state().n = 2;
		state.notify();
		expect(state.version()).toBe(v0 + 1);
	});

	it('a computed refreshes first and bumps only when its value changes', () => {
		const counter = signal(1);
		const parity = computed(() => counter() % 2);
		const v0 = parity.version();
		counter.set(3); // parity is still 1
		expect(parity.version()).toBe(v0);
		counter.set(4);
		expect(parity.version()).toBe(v0 + 1);
	});

	it('is not tracked as a dependency', () => {
		const counter = signal(1);
		let runs = 0;
		const doubled = computed(() => {
			runs++;
			return counter.version();
		});
		doubled();
		counter.set(2);
		doubled();
		expect(runs).toBe(1);
	});
});
