import { TUpdateFn } from "@tsn-function/types";
import { NODE } from "./declarations";
import { ReactiveNode } from "./model";
import { TValueListener, TValueUnsubscribe } from "@ts/subscription/types";

type TEqual<T> = (a: T, b: T) => boolean;

type TReactive<T> = {
	(): T;
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
