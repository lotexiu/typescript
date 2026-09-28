import { describe, it, expect } from 'vitest';
import { ChunkUtils } from '@ts/chunk/utils';

const chunk = new ChunkUtils();

describe('ChunkUtils.bySize', () => {
	it('splits the array into chunks of the given size', () => {
		expect(chunk.bySize([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
	});

	it('returns a single chunk when size >= array length', () => {
		expect(chunk.bySize([1, 2], 10)).toEqual([[1, 2]]);
	});

	it('returns an empty array for size <= 0', () => {
		expect(chunk.bySize([1, 2, 3], 0)).toEqual([]);
		expect(chunk.bySize([1, 2, 3], -1)).toEqual([]);
	});

	it('returns an empty array for an empty input', () => {
		expect(chunk.bySize([], 2)).toEqual([]);
	});
});

describe('ChunkUtils.byWorkers', () => {
	it('splits the array into (up to) `workers` roughly-equal chunks', () => {
		expect(chunk.byWorkers([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([
			[1, 2, 3],
			[4, 5, 6],
			[7],
		]);
	});

	it('returns an empty array for workers <= 0', () => {
		expect(chunk.byWorkers([1, 2, 3], 0)).toEqual([]);
	});
});

describe('ChunkUtils.bySizeCompact', () => {
	it('returns [start, end) position pairs instead of copied slices', () => {
		expect(chunk.bySizeCompact([1, 2, 3, 4, 5], 2)).toEqual([
			[0, 2],
			[2, 4],
			[4, 6],
		]);
	});

	it('returns an empty array for size <= 0', () => {
		expect(chunk.bySizeCompact([1, 2, 3], 0)).toEqual([]);
	});
});

describe('ChunkUtils.byWorkersCompact', () => {
	it('returns position pairs sized for `workers` chunks', () => {
		expect(chunk.byWorkersCompact([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([
			[0, 3],
			[3, 6],
			[6, 9],
		]);
	});

	it('returns an empty array for workers <= 0', () => {
		expect(chunk.byWorkersCompact([1, 2, 3], 0)).toEqual([]);
	});
});
