import { CacheOptions, TCacheGetParam, TCacheReturn } from './types';

/**
 * A string-keyed cache with optional size limit (least recently used goes first) and optional batches:
 * a batch key joins several keys (`a||b`) and stores their values together, kept in sync with the single entries.
 */
class Cache<V> {
	#valueCache: Map<string, V> = new Map<string, V>();
	#batchCache: Map<string, V[]> | null = null;
	#batchKeyCache: Map<string, Set<string>> | null = null;
	readonly #options: Required<CacheOptions>;

	/** Creates an empty cache. */
	constructor(options: CacheOptions = {}) {
		this.#options = { keySeparator: '||', batch: false, maxEntries: Infinity, ...options };
		if (!this.#options.batch) return;
		this.#batchCache = new Map();
		this.#batchKeyCache = new Map();
	}

	/** Whether a key is cached. */
	has(key: string): boolean {
		return this.#valueCache.has(key);
	}

	/** Stores the values of every key in `batchKey` at once (only with `batch: true`). */
	setBatch(batchKey: string, value: V[]): void {
		if (!this.#batchCache) return;
		this.#batchCache.set(batchKey, [...value]);
		batchKey.split(this.#options.keySeparator).forEach((key, index) => {
			if (!this.#batchKeyCache!.has(key)) {
				this.#batchKeyCache!.set(key, new Set());
			}
			this.#batchKeyCache!.get(key)!.add(batchKey);
			this.#valueCache.set(key, value[index]);
			this.#batchKeyCache!.get(key)!.forEach((otherBatchKey) => {
				if (otherBatchKey === batchKey) return;
				const otherCached = this.#batchCache!.get(otherBatchKey);
				if (!otherCached) return;
				const otherIndex = otherBatchKey.split(this.#options.keySeparator).indexOf(key);
				otherCached[otherIndex] = value[index];
			});
		});
	}

	/** The values of every key in `batchKey`, from the stored batch or from the single entries. */
	getBatch(batchKey: string): TCacheReturn<any, V> {
		let cached: TCacheReturn<any, V> = this.#batchCache?.get(batchKey);
		if (!cached) {
			cached = this.get(...(batchKey.split(this.#options.keySeparator) as TCacheGetParam));
		}
		return Array.isArray(cached) ? [...cached] : cached;
	}

	/** Returns the cached value, or builds it with `create`, stores it and returns it (also caches `undefined` results). */
	getOrSet(key: string, create: () => V): V {
		if (this.#valueCache.has(key)) return this.get(key) as V;
		const value = create();
		this.set(key, value);
		return value;
	}

	/** Stores a value; with `maxEntries`, may drop the least recently used entry. */
	set(key: string, value: V): void {
		this.#valueCache.delete(key); // re-insert: Map order doubles as recency
		this.#valueCache.set(key, value);
		this.#evict();
		if (!this.#batchKeyCache) return;
		const batchKeys = this.#batchKeyCache.get(key);
		if (!batchKeys) return;
		batchKeys.forEach((batchKey) => {
			const cached = this.#batchCache?.get(batchKey);
			if (!cached) return;
			const index = batchKey.split(this.#options.keySeparator).indexOf(key);
			cached[index] = value;
		});
	}

	/** One key gives its value (or `undefined`); several keys give the array of their values. */
	get<const Keys extends TCacheGetParam>(...keys: Keys): TCacheReturn<Keys, V> {
		if (keys.length === 1) {
			const key = keys[0];
			const value = this.#valueCache.get(key);
			if (this.#options.maxEntries !== Infinity && this.#valueCache.has(key)) {
				this.#valueCache.delete(key);
				this.#valueCache.set(key, value as V);
			}
			return value as TCacheReturn<Keys, V>;
		}
		if (!this.#options.batch) {
			return keys.map((key) => this.#valueCache.get(key)) as TCacheReturn<Keys, V>;
		}

		const batchKey = keys.join(this.#options.keySeparator);
		const cached = this.#batchCache!.get(batchKey);
		if (cached) return [...cached] as TCacheReturn<Keys, V>;

		const values = keys.map((key) => {
			if (!this.#batchKeyCache!.has(key)) {
				this.#batchKeyCache!.set(key, new Set());
			}
			this.#batchKeyCache!.get(key)!.add(batchKey);
			return this.#valueCache.get(key) as V | undefined;
		});

		this.#batchCache!.set(batchKey, values as V[]);
		return [...values] as TCacheReturn<Keys, V>;
	}

	#evict(): void {
		const { maxEntries } = this.#options;
		while (this.#valueCache.size > maxEntries) {
			this.delete(this.#valueCache.keys().next().value!);
		}
	}

	/** Removes everything. */
	clear(): void {
		this.#valueCache.clear();
		this.#batchCache?.clear();
		this.#batchKeyCache?.clear();
	}

	/** Removes the given keys. */
	delete<const Keys extends TCacheGetParam>(...keys: Keys): void {
		for (const key of keys) {
			this.#valueCache.delete(key);
			this.#batchKeyCache?.get(key)?.forEach((batchKey) => {
				this.#batchCache!.delete(batchKey);
				batchKey.split(this.#options.keySeparator).forEach((siblingKey) => {
					if (siblingKey !== key) {
						this.#batchKeyCache!.get(siblingKey)?.delete(batchKey);
					}
				});
			});
			this.#batchKeyCache?.delete(key);
		}
	}

	/** Cached keys, least recent first. */
	keys(): IterableIterator<string> {
		return this.#valueCache.keys();
	}

	/** Cached values, least recent first. */
	values(): IterableIterator<V> {
		return this.#valueCache.values();
	}

	/** Cached entries, least recent first. */
	entries(): IterableIterator<[string, V]> {
		return this.#valueCache.entries();
	}

	/** Calls `callback` for each entry. */
	forEach(callback: (value: V, key: string, map: Map<string, V>) => void): void {
		this.#valueCache.forEach(callback);
	}

	/** Number of entries. */
	get size(): number {
		return this.#valueCache.size;
	}
}

export { Cache };
