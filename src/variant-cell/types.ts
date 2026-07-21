/** Resolves the value for a given variant name — the function a `VariantCell` is constructed with. */
type TVariantDerive<TName extends string, TValue> = (name: TName) => TValue;

export type {
	TVariantDerive,
}
