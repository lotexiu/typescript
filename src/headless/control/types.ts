import { TMaybeReactive, TWritable } from '../types';

/**
 * Last word on every write: receives the normalized next value and the current one, returns what is actually stored. Return `current` to refuse a change.
 */
type TControlReducer<V> = (next: V, current: V) => V;

/** Options every headless control accepts. */
type TControlOptions<V> = {
	/** Base id for the parts (`<id>`, `<id>-thumb`, `<id>-listbox`...). Generated when left out. */
	readonly id?: string;
	/** Initial value, or a writable (`signal`, `field`, `writable`) to keep the state outside the control. */
	readonly value?: V | TWritable<V>;
	/** Ignores user intents and takes the control out of the tab order. Static or reactive. */
	readonly disabled?: TMaybeReactive<boolean>;
	/** Ignores user intents but keeps the control focusable. Static or reactive. */
	readonly readOnly?: TMaybeReactive<boolean>;
	/** See `TControlReducer`. */
	readonly reducer?: TControlReducer<V>;
};

export type { TControlReducer, TControlOptions };
