import { describe, it, expect } from 'vitest';
import { computed } from '@tsr-node/computed/model';
import { signal } from '@tsr-node/signal/model';

describe('version()', () => {
	it('a signal bumps only on real changes', () => {
		const s = signal(1);
		const v0 = s.version();
		s.set(1);
		expect(s.version()).toBe(v0);
		s.set(2);
		expect(s.version()).toBe(v0 + 1);
	});

	it('notify() bumps even though the reference is the same (in-place mutation)', () => {
		const s = signal({ n: 1 });
		const v0 = s.version();
		s().n = 2;
		s.notify();
		expect(s.version()).toBe(v0 + 1);
	});

	it('a computed refreshes first and bumps only when its value changes', () => {
		const s = signal(1);
		const parity = computed(() => s() % 2);
		const v0 = parity.version();
		s.set(3); // parity is still 1
		expect(parity.version()).toBe(v0);
		s.set(4);
		expect(parity.version()).toBe(v0 + 1);
	});

	it('is not tracked as a dependency', () => {
		const s = signal(1);
		let runs = 0;
		const c = computed(() => {
			runs++;
			return s.version();
		});
		c();
		s.set(2);
		c();
		expect(runs).toBe(1);
	});
});
