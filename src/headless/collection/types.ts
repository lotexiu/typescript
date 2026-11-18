import { TMaybeReactive } from '../types';

/** One item of a `Collection` with everything the controls need about it. */
type TCollectionEntry<T, K> = {
	/** Identity of the item; what selections store. */
	readonly key: K;
	/** The original item. */
	readonly item: T;
	/** Text shown and used by typeahead and filters. */
	readonly label: string;
	/** Cannot be highlighted or chosen. */
	readonly disabled: boolean;
	/** Position in the list. */
	readonly index: number;
};

/**
 * How to read keys, labels and the disabled flag from items. Defaults: a string item is its own key and label; an object uses `value` (or `id`), `label` and `disabled`.
 */
type TCollectionOptions<T, K> = {
	/** The items, static or reactive (a filtered list, data that arrives later). */
	readonly items: TMaybeReactive<readonly T[]>;
	/** Identity of an item. */
	readonly key?: (item: T) => K;
	/** Text of an item. */
	readonly label?: (item: T) => string;
	/** Whether an item is disabled. */
	readonly disabled?: (item: T) => boolean;
};

/**
 * @internal
 */
type TDescribedItem = {
	readonly value?: unknown;
	readonly id?: unknown;
	readonly label?: unknown;
	readonly disabled?: unknown;
};

/**
 * Key type inferred when no `key` accessor is given: `T['value']`, else `T['id']`, else `T` — the same rule used at runtime.
 */
type TDefaultKey<T> = T extends { readonly value: infer Value } ? Value : T extends { readonly id: infer Id } ? Id : T;

export type { TCollectionEntry, TCollectionOptions, TDescribedItem, TDefaultKey };
