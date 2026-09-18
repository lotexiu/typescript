export class AsyncUtils {
	static sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	static async retry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
		try {
			return await fn();
		} catch (error) {
			if (retries <= 0) throw error;
			await AsyncUtils.sleep(delayMs);
			return AsyncUtils.retry(fn, retries - 1, delayMs * 2);
		}
	}

	static async mapConcurrent<T, R>(
		items: readonly T[],
		concurrency: number,
		fn: (item: T) => Promise<R>
	): Promise<R[]> {
		const results: R[] = new Array(items.length);
		let index = 0;

		const worker = async () => {
			while (index < items.length) {
				const i = index++;
				results[i] = await fn(items[i]);
			}
		};

		const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
		await Promise.all(workers);
		return results;
	}
}
