import { describe, it, expect } from 'vitest';
import { writable } from '@ts/composables/writable/model';
import { Computed } from '@tsr-node/computed/model';
import { signal } from '@tsr-node/signal/model';

describe('writable', () => {
	it('reads through a computed and writes through the given function', () => {
		const celsius = signal(0);
		const fahrenheit = writable(
			() => celsius() * 1.8 + 32,
			(value) => celsius.set((value - 32) / 1.8)
		);
		expect(fahrenheit()).toBe(32);
		expect(fahrenheit.set(212)).toBe(true);
		expect(celsius()).toBe(100);
		expect(fahrenheit.update((value) => value)).toBe(false);
		expect(fahrenheit).toBeInstanceOf(Computed);
	});
});
