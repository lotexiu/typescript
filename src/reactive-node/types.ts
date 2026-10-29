import { TUpdateFn } from "@tsn-function/types";
import { NODE } from "./declarations";
import { ReactiveNode } from "./model";
import { TValueListener, TValueUnsubscribe } from "@ts/subscription/types";

type TEqual<T> = (left: T, right: T) => boolean;

type TReactive<T> = {
	(): T;
	/**
	 * Changes counter, read without tracking. Lets an adapter (a UI binding, an external store) detect
	 * changes by comparing numbers even when the value is mutated in place and keeps the same reference.
	 */
	version(): number;
	subscribe(listener: TValueListener<T>): TValueUnsubscribe;
	dispose(): void;
};

type TReactiveSet<T> = (value: T) => boolean;

type TReactiveUpdate<T> = (fn: TUpdateFn<T>) => boolean;

/**
 * @internal
 */
type TWithNode<T> = {
	[NODE]: ReactiveNode<T>;
};

export type { TEqual, TReactive, TReactiveSet, TReactiveUpdate, TWithNode };
