type CacheOptions = {
	batch?: boolean;
	keySeparator?: string;
};

type TCacheGetParam = [key: string, ...keys: string[]];

type TCacheReturn<Keys extends TCacheGetParam, V> =
	Keys['length'] extends 1 ? V | undefined : Array<V>;

export { CacheOptions, TCacheGetParam, TCacheReturn };
