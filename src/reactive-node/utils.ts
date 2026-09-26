import { TValueListener, TValueUnsubscribe } from '@ts/subscription/types';
import { NODE } from './declarations';
import { TWithNode } from './types';

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
}

export { ReactiveNodeUtils };
