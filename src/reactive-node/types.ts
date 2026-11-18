import { TUpdateFn } from "@tsn-function/types";
import { NODE } from "./declarations";
import { ReactiveNode } from "./model";
import { TValueListener, TValueUnsubscribe } from "@ts/subscription/types";

/** Decides whether a new value equals the old one (no change, no notification). Default `Object.is`. */
type TEqual<T> = (left: T, right: T) => boolean;

/** Anything readable reactively: call it to read (tracked inside a `computed`), subscribe to changes. */
type TReactive<T> = {
	(): T;
	/**
	 * Changes counter, read without tracking. Lets an adapter (a UI binding, an external store) detect
	 * changes by comparing numbers even when the value is mutated in place and keeps the same reference.
	 */
	version(): number;
	/** Calls `listener` with the new value after each change. Returns the function that unsubscribes. */
	subscribe(listener: TValueListener<T>): TValueUnsubscribe;
	/** Drops listeners and dependencies. */
	dispose(): void;
};

/** Replaces the value; returns whether it changed. */
type TReactiveSet<T> = (value: T) => boolean;

/** Replaces the value with `fn(current)`; returns whether it changed. */
type TReactiveUpdate<T> = (fn: TUpdateFn<T>) => boolean;

/**
 * @internal
 */
type TWithNode<T> = {
	[NODE]: ReactiveNode<T>;
};

export type { TEqual, TReactive, TReactiveSet, TReactiveUpdate, TWithNode };
