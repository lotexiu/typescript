import type { TRelease, TWaiter } from './types';

/**
 * Semáforo assíncrono, justo (FIFO): no máximo `permits` tarefas ao mesmo tempo. `run(fn)` garante a devolução mesmo se `fn` lançar.
 * Vale **dentro de uma thread** (várias tarefas assíncronas pendentes); não protege nada entre workers — isso exigiria `SharedArrayBuffer` + `Atomics`.
 * Aceita `AbortSignal`: quem está na fila e é cancelado sai dela e rejeita com `signal.reason`.
 */
class Semaphore {
	readonly permits: number;
	#available: number;
	readonly #queue: TWaiter[] = [];

	constructor(permits: number) {
		if (!Number.isInteger(permits) || permits < 1) throw new RangeError('Semaphore: permits precisa ser um inteiro ≥ 1');
		this.permits = permits;
		this.#available = permits;
	}

	/** Permissões livres agora. */
	get available(): number {
		return this.#available;
	}

	/** Quantos estão esperando. */
	get pending(): number {
		return this.#queue.length;
	}

	#release(): TRelease {
		let released = false;
		return () => {
			if (released) return;
			released = true;
			const next = this.#queue.shift();
			if (next) next.grant();
			else this.#available++;
		};
	}

	/** Pega uma permissão sem esperar; `undefined` se não houver. */
	tryAcquire(): TRelease | undefined {
		if (this.#available === 0) return undefined;
		this.#available--;
		return this.#release();
	}

	acquire(signal?: AbortSignal): Promise<TRelease> {
		if (signal?.aborted) return Promise.reject(signal.reason);
		const now = this.tryAcquire();
		if (now) return Promise.resolve(now);
		return new Promise<TRelease>((resolve, reject) => {
			const waiter: TWaiter = {
				grant: () => {
					signal?.removeEventListener('abort', onAbort);
					resolve(this.#release());
				},
				reject,
			};
			const onAbort = () => {
				const index = this.#queue.indexOf(waiter);
				if (index >= 0) this.#queue.splice(index, 1);
				reject(signal!.reason);
			};
			signal?.addEventListener('abort', onAbort, { once: true });
			this.#queue.push(waiter);
		});
	}

	async run<T>(fn: () => Promise<T> | T, signal?: AbortSignal): Promise<T> {
		const release = await this.acquire(signal);
		try {
			return await fn();
		} finally {
			release();
		}
	}
}

export { Semaphore };
