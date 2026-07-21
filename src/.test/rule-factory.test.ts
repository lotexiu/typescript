import { describe, expect, it, vi } from 'vitest';
import { createFactory } from '@ts/rule-factory/implementations';

describe('createFactory', () => {
	it('derives each slot from the given seeds', () => {
		const build = createFactory<{ base: number }, { doubled: number; tripled: number }>({
			doubled: { derive: ({ seeds }) => seeds.base * 2 },
			tripled: { derive: ({ seeds }) => seeds.base * 3 },
		});

		const { values } = build({ base: 10 });
		expect(values).toEqual({ doubled: 20, tripled: 30 });
	});

	it('resolves a slot that depends on another slot declared earlier', () => {
		const build = createFactory<{ base: string }, { primary: string; onPrimary: string }>({
			primary: { derive: ({ seeds }) => seeds.base },
			onPrimary: { derive: ({ get }) => (get('primary') === 'dark' ? 'white' : 'black') },
		});

		const { values } = build({ base: 'dark' });
		expect(values.onPrimary).toBe('white');
		expect(values.primary).toBe('dark');
	});

	it('throws a clear error when a slot references one declared after it, instead of resolving out of order', () => {
		const build = createFactory<{}, { onPrimary: string; primary: string }>({
			onPrimary: { derive: ({ get }) => get('primary') },
			primary: { derive: () => 'dark' },
		});

		expect(() => build({})).toThrow(/not resolved yet/i);
	});

	it('derives a slot referenced by more than one later slot only once', () => {
		const deriveBase = vi.fn(() => 42);
		const build = createFactory<{}, { base: number; a: number; b: number }>({
			base: { derive: deriveBase },
			a: { derive: ({ get }) => get('base') + 1 },
			b: { derive: ({ get }) => get('base') + 2 },
		});

		const { values } = build({});
		expect(values).toEqual({ base: 42, a: 43, b: 44 });
		expect(deriveBase).toHaveBeenCalledTimes(1);
	});

	it('exposes a suggestion separately without ever changing the resolved value', () => {
		const build = createFactory<{ contrast: number }, { text: string }>({
			text: {
				derive: () => 'gray',
				suggest: ({}, { seeds }) => (seeds.contrast < 3 ? 'black' : undefined),
			},
		});

		const lowContrast = build({ contrast: 1 });
		expect(lowContrast.values.text).toBe('gray');
		expect(lowContrast.suggestions.text).toBe('black');

		const goodContrast = build({ contrast: 5 });
		expect(goodContrast.values.text).toBe('gray');
		expect(goodContrast.suggestions).not.toHaveProperty('text');
	});

	it('does not list a suggestion that matches the already-resolved value', () => {
		const build = createFactory<{}, { text: string }>({
			text: {
				derive: () => 'black',
				suggest: (value) => value,
			},
		});

		const { suggestions } = build({});
		expect(suggestions).not.toHaveProperty('text');
	});
});
