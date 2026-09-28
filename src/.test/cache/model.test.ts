import { describe, it, expect } from 'vitest';
import { Cache } from '@ts/cache/model';

describe('Cache basics (no batching)', () => {
	it('set/get/has round-trip a single value', () => {
		const cache = new Cache<number>();
		cache.set('a', 1);
		expect(cache.has('a')).toBe(true);
		expect(cache.get('a')).toBe(1);
	});

	it('get returns undefined for a missing key', () => {
		const cache = new Cache<number>();
		expect(cache.get('missing')).toBeUndefined();
		expect(cache.has('missing')).toBe(false);
	});

	it('get with multiple keys returns a parallel array of values', () => {
		const cache = new Cache<number>();
		cache.set('a', 1);
		cache.set('b', 2);
		expect(cache.get('a', 'b', 'c')).toEqual([1, 2, undefined]);
	});

	it('delete removes a key', () => {
		const cache = new Cache<number>();
		cache.set('a', 1);
		cache.delete('a');
		expect(cache.has('a')).toBe(false);
	});

	it('clear empties the cache', () => {
		const cache = new Cache<number>();
		cache.set('a', 1);
		cache.set('b', 2);
		cache.clear();
		expect(cache.size).toBe(0);
	});

	it('size reflects the number of cached keys', () => {
		const cache = new Cache<number>();
		cache.set('a', 1);
		cache.set('b', 2);
		expect(cache.size).toBe(2);
	});

	it('keys/values/entries iterate the underlying map', () => {
		const cache = new Cache<number>();
		cache.set('a', 1);
		cache.set('b', 2);
		expect([...cache.keys()]).toEqual(['a', 'b']);
		expect([...cache.values()]).toEqual([1, 2]);
		expect([...cache.entries()]).toEqual([
			['a', 1],
			['b', 2],
		]);
	});

	it('forEach visits every entry', () => {
		const cache = new Cache<number>();
		cache.set('a', 1);
		cache.set('b', 2);
		const seen: Array<[string, number]> = [];
		cache.forEach((value, key) => seen.push([key, value]));
		expect(seen).toEqual([
			['a', 1],
			['b', 2],
		]);
	});
});

describe('Cache batching', () => {
	it('setBatch populates both the batch entry and each individual key', () => {
		const cache = new Cache<number>({ batch: true });
		cache.setBatch('a||b', [1, 2]);
		expect(cache.get('a')).toBe(1);
		expect(cache.get('b')).toBe(2);
		expect(cache.getBatch('a||b')).toEqual([1, 2]);
	});

	it('get with multiple keys caches and returns the batch', () => {
		const cache = new Cache<number>({ batch: true });
		cache.set('a', 1);
		cache.set('b', 2);
		expect(cache.get('a', 'b')).toEqual([1, 2]);
		expect(cache.getBatch('a||b')).toEqual([1, 2]);
	});

	it('getBatch falls back to per-key lookups when the batch was never fetched together', () => {
		const cache = new Cache<number>({ batch: true });
		cache.set('a', 1);
		cache.set('b', 2);
		expect(cache.getBatch('a||b')).toEqual([1, 2]);
	});

	it('getBatch returns a copy, not the live cached array', () => {
		const cache = new Cache<number>({ batch: true });
		cache.setBatch('a||b', [1, 2]);
		const result = cache.getBatch('a||b') as number[];
		result[0] = 999;
		expect(cache.getBatch('a||b')).toEqual([1, 2]);
	});

	it('set() on an individual key patches every batch that includes it', () => {
		const cache = new Cache<number>({ batch: true });
		cache.setBatch('a||b', [1, 2]);
		cache.set('a', 100);
		expect(cache.getBatch('a||b')).toEqual([100, 2]);
		expect(cache.get('a')).toBe(100);
	});

	it('setBatch() on an overlapping batch patches the other batch too', () => {
		const cache = new Cache<number>({ batch: true });
		cache.setBatch('a||b', [1, 2]);
		cache.setBatch('b||c', [20, 30]);
		expect(cache.getBatch('a||b')).toEqual([1, 20]);
		expect(cache.getBatch('b||c')).toEqual([20, 30]);
	});

	it('supports a custom key separator', () => {
		const cache = new Cache<number>({ batch: true, keySeparator: ',' });
		cache.setBatch('a,b', [1, 2]);
		expect(cache.getBatch('a,b')).toEqual([1, 2]);
		expect(cache.get('a')).toBe(1);
	});

	it('delete on a key invalidates every batch containing it', () => {
		const cache = new Cache<number>({ batch: true });
		cache.setBatch('a||b', [1, 2]);
		cache.delete('a');
		expect(cache.has('a')).toBe(false);
		// the whole stale batch entry is dropped, so getBatch recomputes from individual keys
		expect(cache.getBatch('a||b')).toEqual([undefined, 2]);
	});
});
