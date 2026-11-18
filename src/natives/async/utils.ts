import { TimeoutError } from './error';

/** Promise helpers: waiting, time limits, retries and bounded concurrency. */
export class AsyncUtils {
	/** Resolves after `ms` milliseconds. */
	static sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Falha com `TimeoutError` se o trabalho passar de `ms`. Se receber uma função, ela ganha um `AbortSignal` que é abortado
	 * no estouro (para cancelar `fetch` etc.); se receber uma promessa, ela segue rodando — só o resultado é descartado.
	 */
	static timeout<T>(work: Promise<T> | ((signal: AbortSignal) => Promise<T>), ms: number): Promise<T> {
		const controller = new AbortController();
		const promise = typeof work === 'function' ? work(controller.signal) : work;
		return new Promise<T>((resolve, reject) => {
			const timer = setTimeout(() => {
				const error = new TimeoutError(ms);
				controller.abort(error);
				reject(error);
			}, ms);
			promise.then(resolve, reject).finally(() => clearTimeout(timer));
		});
	}

	/**
	 * Calls `fn` until it resolves, up to `retries` extra attempts, waiting `delayMs` before the first retry and doubling the wait each time. Rethrows the last error.
	 */
	static async retry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
		try {
			return await fn();
		} catch (error) {
			if (retries <= 0) throw error;
			await AsyncUtils.sleep(delayMs);
			return AsyncUtils.retry(fn, retries - 1, delayMs * 2);
		}
	}

	/**
	 * Maps `items` through an async `fn` with at most `concurrency` calls running at once. Results keep the input order.
	 */
	static async mapConcurrent<T, R>(
		items: readonly T[],
		concurrency: number,
		fn: (item: T) => Promise<R>
	): Promise<R[]> {
		const results: R[] = new Array(items.length);
		let index = 0;

		const worker = async () => {
			while (index < items.length) {
				const currentIndex = index++;
				results[currentIndex] = await fn(items[currentIndex]);
			}
		};

		const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
		await Promise.all(workers);
		return results;
	}
}
