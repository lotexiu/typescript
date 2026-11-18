/** Resolves the value for a given variant name — the function a `VariantCell` is constructed with. */
type TVariantDerive<TName, TValue> = (name: TName) => TValue;
/** A key with its derived value. */
type TVariant<Key, Value> = {
	/** The key. */
	key: Key
	/** The value derived from it. */
	value: Value
}

export type {
	TVariantDerive,
	TVariant
}
