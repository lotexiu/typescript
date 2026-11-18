/** Options of a `Cache`. */
type CacheOptions = {
	/** Enables `setBatch`/`getBatch`. Default `false`. */
	batch?: boolean;
	/** Separator of the keys inside a batch key. Default `||`. */
	keySeparator?: string;
	/** Keeps at most this many entries; the least recently read/written one is dropped first. Unlimited when omitted. */
	maxEntries?: number;
};

/** One or more keys. */
type TCacheGetParam = [key: string, ...keys: string[]];

/** What `get` returns: a value for one key, an array for several. */
type TCacheReturn<Keys extends TCacheGetParam, V> =
	Keys['length'] extends 1 ? V | undefined : Array<V>;

export { CacheOptions, TCacheGetParam, TCacheReturn };
