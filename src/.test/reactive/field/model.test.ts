import { describe, it, expect, vi } from 'vitest';
import { signal } from '@tsr-node/signal/model';
import { field, Field } from '@tsr/field/model';
import { Computed } from '@tsr-node/computed/model';

describe('field', () => {
	it('reads a derived slice of the source signal', () => {
		const source = signal({ name: 'Ada', age: 30 });
		const name = field(
			source,
			(s) => s.name,
			(s, v) => (s.name = v)
		);
		expect(name()).toBe('Ada');
	});

	it('updates when the source changes elsewhere', () => {
		const source = signal({ name: 'Ada', age: 30 });
		const name = field(
			source,
			(s) => s.name,
			(s, v) => (s.name = v)
		);
		source.set({ name: 'Grace', age: 40 });
		expect(name()).toBe('Grace');
	});

	it('is recognized as a Computed (read-only shape) plus `instanceof Field`', () => {
		const source = signal({ name: 'Ada' });
		const name = field(
			source,
			(s) => s.name,
			(s, v) => (s.name = v)
		);
		expect(name instanceof Computed).toBe(true);
		expect(name instanceof Field).toBe(true);
	});
});

describe('field.set', () => {
	it('mutates the source in place through the setter and notifies it', () => {
		const source = signal({ name: 'Ada', age: 30 });
		const name = field(
			source,
			(s) => s.name,
			(s, v) => (s.name = v)
		);
		name.set('Grace');
		expect(source().name).toBe('Grace');
		expect(name()).toBe('Grace');
	});

	it('propagates to subscribers of the source signal', () => {
		const source = signal({ name: 'Ada' });
		const name = field(
			source,
			(s) => s.name,
			(s, v) => (s.name = v)
		);
		const listener = vi.fn();
		source.subscribe(listener);
		name.set('Grace');
		expect(listener).toHaveBeenCalledWith({ name: 'Grace' });
	});

	it('returns whether the field-visible value actually changed', () => {
		const source = signal({ name: 'Ada' });
		const name = field(
			source,
			(s) => s.name,
			(s, v) => (s.name = v)
		);
		expect(name.set('Ada')).toBe(false);
		expect(name.set('Grace')).toBe(true);
	});
});

describe('field.update', () => {
	it('derives the next value from the current one and applies it via set', () => {
		const source = signal({ count: 1 });
		const count = field(
			source,
			(s) => s.count,
			(s, v) => (s.count = v)
		);
		count.update((v) => v + 1);
		expect(source().count).toBe(2);
		expect(count()).toBe(2);
	});
});
