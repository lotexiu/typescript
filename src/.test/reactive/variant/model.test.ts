import { describe, it, expect, vi } from 'vitest';
import { variant, Variant } from '@tsr/variant/model';
import { Computed } from '@tsr-node/computed/model';

describe('variant', () => {
	it('derives its value from the current key via the given function', () => {
		const v = variant<'a' | 'b', number>((key) => (key === 'a' ? 1 : 2), 'a');
		expect(v()).toBe(1);
	});

	it('recomputes when the key signal changes', () => {
		const v = variant<'a' | 'b', number>((key) => (key === 'a' ? 1 : 2), 'a');
		v.key.set('b');
		expect(v()).toBe(2);
	});

	it('exposes the key as a writable Signal', () => {
		const v = variant<'a' | 'b', 'a' | 'b'>((key) => key, 'a');
		expect(v.key()).toBe('a');
		v.key.set('b');
		expect(v.key()).toBe('b');
	});

	it('only calls derive again when the key actually changes', () => {
		const derive = vi.fn((key: 'a' | 'b') => key.toUpperCase());
		const v = variant<'a' | 'b', string>(derive, 'a');
		v();
		v();
		expect(derive).toHaveBeenCalledOnce();
		v.key.set('a'); // same value, no-op via signal equality
		v();
		expect(derive).toHaveBeenCalledOnce();
		v.key.set('b');
		v();
		expect(derive).toHaveBeenCalledTimes(2);
	});

	it('is recognized as a Computed and `instanceof Variant`', () => {
		const v = variant<string, string>((key) => key, 'a');
		expect(v instanceof Computed).toBe(true);
		expect(v instanceof Variant).toBe(true);
	});

	it('subscribers are notified when the derived value changes', () => {
		const v = variant<'a' | 'b', string>((key) => (key === 'a' ? 'first' : 'second'), 'a');
		const listener = vi.fn();
		v.subscribe(listener);
		v.key.set('b');
		expect(listener).toHaveBeenCalledWith('second');
	});
});
