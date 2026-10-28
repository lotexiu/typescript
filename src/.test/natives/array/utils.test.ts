import { describe, it, expect } from 'vitest';
import { ArrayUtils } from '@tsn-array/utils';

describe('ArrayUtils.groupBy', () => {
	it('groups items by the selected key', () => {
		const items = [{ type: 'a', v: 1 }, { type: 'b', v: 2 }, { type: 'a', v: 3 }];
		const grouped = ArrayUtils.groupBy(items, (i) => i.type);
		expect(grouped).toEqual({
			a: [{ type: 'a', v: 1 }, { type: 'a', v: 3 }],
			b: [{ type: 'b', v: 2 }],
		});
	});

	it('returns an empty object for an empty array', () => {
		expect(ArrayUtils.groupBy([], (i: never) => i)).toEqual({});
	});

	it('preserves original item order within each group', () => {
		const items = [3, 1, 4, 1, 5, 9, 2, 6];
		const grouped = ArrayUtils.groupBy(items, (n) => (n % 2 === 0 ? 'even' : 'odd'));
		expect(grouped.odd).toEqual([3, 1, 1, 5, 9]);
		expect(grouped.even).toEqual([4, 2, 6]);
	});
});

describe('ArrayUtils.uniqueBy', () => {
	it('keeps only the first occurrence of each key', () => {
		const items = [{ id: 1, n: 'a' }, { id: 2, n: 'b' }, { id: 1, n: 'c' }];
		expect(ArrayUtils.uniqueBy(items, (i) => i.id)).toEqual([
			{ id: 1, n: 'a' },
			{ id: 2, n: 'b' },
		]);
	});

	it('does not mutate the input array', () => {
		const items = [1, 1, 2];
		const result = ArrayUtils.uniqueBy(items, (i) => i);
		expect(items).toEqual([1, 1, 2]);
		expect(result).toEqual([1, 2]);
	});

	it('returns an empty array for an empty input', () => {
		expect(ArrayUtils.uniqueBy([], (i: never) => i)).toEqual([]);
	});
});

describe('ArrayUtils.sortBy', () => {
	it('sorts ascending by default', () => {
		const items = [{ n: 3 }, { n: 1 }, { n: 2 }];
		expect(ArrayUtils.sortBy(items, { key: (i) => i.n })).toEqual([{ n: 1 }, { n: 2 }, { n: 3 }]);
	});

	it('sorts descending when requested', () => {
		const items = [{ n: 3 }, { n: 1 }, { n: 2 }];
		expect(ArrayUtils.sortBy(items, { key: (i) => i.n, order: 'desc' })).toEqual([
			{ n: 3 },
			{ n: 2 },
			{ n: 1 },
		]);
	});

	it('breaks ties using subsequent selectors', () => {
		const items = [
			{ group: 'b', n: 2 },
			{ group: 'a', n: 2 },
			{ group: 'a', n: 1 },
		];
		expect(
			ArrayUtils.sortBy(
				items,
				{ key: (i) => i.group },
				{ key: (i) => i.n }
			)
		).toEqual([
			{ group: 'a', n: 1 },
			{ group: 'a', n: 2 },
			{ group: 'b', n: 2 },
		]);
	});

	it('does not mutate the input array', () => {
		const items = [3, 1, 2];
		const result = ArrayUtils.sortBy(items, { key: (i) => i });
		expect(items).toEqual([3, 1, 2]);
		expect(result).toEqual([1, 2, 3]);
	});
});

describe('ArrayUtils.partition / range / zip', () => {
	it('partition splits by predicate and keeps order', () => {
		expect(ArrayUtils.partition([1, 2, 3, 4, 5], (n) => n % 2 === 0)).toEqual([[2, 4], [1, 3, 5]]);
	});

	it('range counts up, down and ignores a zero step', () => {
		expect(ArrayUtils.range(0, 4)).toEqual([0, 1, 2, 3]);
		expect(ArrayUtils.range(5, 0, -2)).toEqual([5, 3, 1]);
		expect(ArrayUtils.range(0, 3, 0)).toEqual([]);
	});

	it('zip pairs by index and stops at the shortest', () => {
		expect(ArrayUtils.zip([1, 2, 3], ['a', 'b'])).toEqual([[1, 'a'], [2, 'b']]);
	});
});
