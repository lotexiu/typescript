import { TValueListener, TValueUnsubscribe } from "@tsr/subscription/types";
import { NODE } from "./declarations";
import { ReactiveNode } from "./model";

type TEqual<T> = (a: T, b: T) => boolean;

type TReactive<T> = {
	(): T;
	subscribe(listener: TValueListener<T>): TValueUnsubscribe;
	dispose(): void;
};

/**
 * @internal
 */
type TWithNode<T> = {
	[NODE]: ReactiveNode<T>;
};

export type { TEqual, TReactive, TWithNode };
