import { TValueListener, TValueUnsubscribe } from '@ts/subscription/types';
import { NODE } from './declarations';
import { ReactiveNode } from './model';

type TEqual<T> = (a: T, b: T) => boolean;

type TReadable<T> = {
	(): T;
	subscribe(listener: TValueListener<T>): TValueUnsubscribe;
	dispose(): void;
};

type TSignal<T> = TReadable<T> & {
	set(next: T): boolean;
	update(fn: (value: T) => T): boolean;
	notify(): void;
};

type TComputed<T> = TReadable<T>;

/**
 * @internal
 */
type TWithNode<T> = {
	[NODE]: ReactiveNode<T>;
};

export type { TEqual, TReadable, TSignal, TComputed, TWithNode };
