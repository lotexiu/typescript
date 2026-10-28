import { describe, it, expect } from 'vitest';
import { selection } from '@ts/composables/selection/model';

describe('selection size / isEmpty / set', () => {
	it('size and isEmpty follow the selection', () => {
		const s = selection<string>();
		expect(s.isEmpty()).toBe(true);
		s.select('a', 'b');
		expect(s.size()).toBe(2);
		expect(s.isEmpty()).toBe(false);
		s.clear();
		expect(s.size()).toBe(0);
	});

	it('set replaces everything with a single notification', () => {
		const s = selection(['a', 'b']);
		const seen: string[][] = [];
		s.subscribe((v) => seen.push(v));
		s.set(['c', 'd', 'e']);
		expect(s()).toEqual(['c', 'd', 'e']);
		expect(seen).toHaveLength(1);
	});

	it('set accepts the current values without losing them', () => {
		const s = selection(['a']);
		s.set(s());
		expect(s()).toEqual(['a']);
	});
});
