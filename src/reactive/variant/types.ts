/** Resolves the value for a given variant name — the function a `VariantCell` is constructed with. */
type TVariantDerive<TName, TValue> = (name: TName) => TValue;
type TVariant<Key, Value> = {
	key: Key
	value: Value
}

export type {
	TVariantDerive,
	TVariant
}
