import { describe, it, expect, vi } from 'vitest';
import { AsyncUtils } from '@tsn/async/utils';

describe('AsyncUtils.sleep', () => {
	it('resolves after the given delay', async () => {
		vi.useFakeTimers();
		const spy = vi.fn();
		AsyncUtils.sleep(1000).then(spy);
		await vi.advanceTimersByTimeAsync(999);
		expect(spy).not.toHaveBeenCalled();
		await vi.advanceTimersByTimeAsync(1);
		expect(spy).toHaveBeenCalledOnce();
		vi.useRealTimers();
	});
});

describe('AsyncUtils.retry', () => {
	it('returns the result on the first successful call', async () => {
		const fn = vi.fn().mockResolvedValue('ok');
		await expect(AsyncUtils.retry(fn, 3, 0)).resolves.toBe('ok');
		expect(fn).toHaveBeenCalledOnce();
	});

	it('retries on failure until it succeeds', async () => {
		const fn = vi
			.fn()
			.mockRejectedValueOnce(new Error('fail 1'))
			.mockRejectedValueOnce(new Error('fail 2'))
			.mockResolvedValueOnce('ok');
		await expect(AsyncUtils.retry(fn, 5, 0)).resolves.toBe('ok');
		expect(fn).toHaveBeenCalledTimes(3);
	});

	it('throws the last error once retries are exhausted', async () => {
		const error = new Error('always fails');
		const fn = vi.fn().mockRejectedValue(error);
		await expect(AsyncUtils.retry(fn, 2, 0)).rejects.toBe(error);
		expect(fn).toHaveBeenCalledTimes(3);
	});

	it('does not retry when retries is 0', async () => {
		const error = new Error('fail');
		const fn = vi.fn().mockRejectedValue(error);
		await expect(AsyncUtils.retry(fn, 0, 0)).rejects.toBe(error);
		expect(fn).toHaveBeenCalledOnce();
	});

	it('backs off exponentially between attempts', async () => {
		vi.useFakeTimers();
		const error = new Error('fail');
		const fn = vi.fn().mockRejectedValueOnce(error).mockRejectedValueOnce(error).mockResolvedValueOnce('ok');

		const promise = AsyncUtils.retry(fn, 3, 100);

		await vi.advanceTimersByTimeAsync(0);
		expect(fn).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(100);
		expect(fn).toHaveBeenCalledTimes(2);

		await vi.advanceTimersByTimeAsync(199);
		expect(fn).toHaveBeenCalledTimes(2);
		await vi.advanceTimersByTimeAsync(1);
		expect(fn).toHaveBeenCalledTimes(3);

		await expect(promise).resolves.toBe('ok');
		vi.useRealTimers();
	});
});

describe('AsyncUtils.mapConcurrent', () => {
	it('maps every item and preserves result order regardless of completion order', async () => {
		const items = [30, 10, 20];
		const result = await AsyncUtils.mapConcurrent(items, 3, async (ms) => {
			await AsyncUtils.sleep(ms);
			return ms;
		});
		expect(result).toEqual([30, 10, 20]);
	});

	it('never runs more than `concurrency` items at once', async () => {
		const items = [1, 2, 3, 4, 5, 6];
		let active = 0;
		let maxActive = 0;
		await AsyncUtils.mapConcurrent(items, 2, async (n) => {
			active++;
			maxActive = Math.max(maxActive, active);
			await Promise.resolve();
			active--;
			return n;
		});
		expect(maxActive).toBeLessThanOrEqual(2);
	});

	it('handles an empty array', async () => {
		const result = await AsyncUtils.mapConcurrent([], 4, async (n: number) => n);
		expect(result).toEqual([]);
	});

	it('clamps concurrency to the number of items', async () => {
		let concurrent = 0;
		let maxConcurrent = 0;
		await AsyncUtils.mapConcurrent([1, 2], 10, async (n) => {
			concurrent++;
			maxConcurrent = Math.max(maxConcurrent, concurrent);
			await Promise.resolve();
			concurrent--;
			return n;
		});
		expect(maxConcurrent).toBe(2);
	});

	it('propagates a rejection from any worker', async () => {
		const error = new Error('boom');
		await expect(
			AsyncUtils.mapConcurrent([1, 2, 3], 2, async (n) => {
				if (n === 2) throw error;
				return n;
			})
		).rejects.toBe(error);
	});
});
