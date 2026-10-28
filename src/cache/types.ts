type CacheOptions = {
	batch?: boolean;
	keySeparator?: string;
	/** Keeps at most this many entries; the least recently read/written one is dropped first. Unlimited when omitted. */
	maxEntries?: number;
};

type TCacheGetParam = [key: string, ...keys: string[]];

type TCacheReturn<Keys extends TCacheGetParam, V> =
	Keys['length'] extends 1 ? V | undefined : Array<V>;

export { CacheOptions, TCacheGetParam, TCacheReturn };
