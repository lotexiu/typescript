import { describe, expect, it } from 'vitest';
import { PathMap } from '@ts/path-map/model';

describe('PathMap', () => {
	it('adds and retrieves values at a path', () => {
		const map = new PathMap<[string, string], number>();
		map.add(['a', 'b'], 1, 2);

		expect(map.get(['a', 'b'])).toEqual([1, 2]);
	});

	it('returns an empty array for a path that was never added', () => {
		const map = new PathMap<[string, string], number>();
		expect(map.get(['x', 'y'])).toEqual([]);
	});

	it('keeps separate branches independent', () => {
		const map = new PathMap<[string, string], number>();
		map.add(['a', 'b'], 1);
		map.add(['a', 'c'], 2);

		expect(map.get(['a', 'b'])).toEqual([1]);
		expect(map.get(['a', 'c'])).toEqual([2]);
	});

	it('removes a value and prunes empty intermediate nodes', () => {
		const map = new PathMap<[string, string], number>();
		map.add(['a', 'b'], 1);

		map.remove(['a', 'b'], 1);

		expect(map.get(['a', 'b'])).toEqual([]);
		expect(map.root.has('a')).toBe(false);
	});

	it('removing one value keeps sibling values at the same node', () => {
		const map = new PathMap<[string, string], number>();
		map.add(['a', 'b'], 1, 2);

		map.remove(['a', 'b'], 1);

		expect(map.get(['a', 'b'])).toEqual([2]);
		expect(map.root.has('a')).toBe(true);
	});
});
