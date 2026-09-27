import { TValueListener, TValueUnsubscribe } from '@tsr/subscription/types';
import { NODE } from './declarations';
import { TWithNode } from './types';
import { Computed } from './computed/model';
import { Signal } from './signal/model';

/**
 * @internal
 */
class ReactiveNodeUtils {
	static set<T>(this: TWithNode<T>, next: T): boolean {
		return this[NODE].write(next);
	}

	static update<T>(this: TWithNode<T>, fn: (value: T) => T): boolean {
		const node = this[NODE];
		return node.write(fn(node.readUntracked()));
	}

	static notify<T>(this: TWithNode<T>): void {
		this[NODE].notify();
	}

	static subscribe<T>(this: TWithNode<T>, listener: TValueListener<T>): TValueUnsubscribe {
		return this[NODE].subscribe(listener);
	}

	static dispose<T>(this: TWithNode<T>): void {
		this[NODE].dispose();
	}

	static node<T>(value: Computed<T> | Signal<T>) {
		const instance: TWithNode<T> = value as any;
		return instance[NODE];
	}
}

export { ReactiveNodeUtils };
