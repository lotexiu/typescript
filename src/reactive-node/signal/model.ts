import { TReactiveSet, TReactiveUpdate } from '@tsr-node/types';
import { NODE } from '../declarations';
import { ReactiveNode } from '../model';
import { TEqual, TReactive } from '../types';
import { ReactiveNodeUtils } from '../utils';

const { set, update, notify, subscribe, dispose, version } = ReactiveNodeUtils;

/**
 * A reactive value: call it to read, `set`/`update` to change, `notify` after mutating it in place.
 * @example
 * const names = signal(new Set<string>())
 * names().add('Ana')
 * names.notify()
 */
function signal<T>(initial: T, equal?: TEqual<T>): Signal<T>;
function signal<T>(initial?: T, equal?: TEqual<T | undefined>): Signal<T | undefined>;
function signal<T>(initial?: T, equal?: TEqual<T | undefined>): Signal<T | undefined> {
	const node = ReactiveNode.source(initial, equal);
	const instance: any = () => node.read();
	instance[NODE] = node;
	instance.set = set;
	instance.update = update;
	instance.notify = notify;
	instance.subscribe = subscribe;
	instance.dispose = dispose;
	instance.version = version;
	return instance;
}

/** A writable reactive value. */
type Signal<T> = TReactive<T> & {
	set: TReactiveSet<T>;
	update: TReactiveUpdate<T>;
	notify(): void;
};
/**
 * `Signal.batch` groups writes into one notification; `Signal.untracked` reads without tracking. Also the `instanceof` check.
 */
const Signal = {
	batch: <R>(fn: () => R): R => ReactiveNode.batch(fn),
	untracked: <R>(fn: () => R): R => ReactiveNode.untracked(fn),
	[Symbol.hasInstance](instance: any): instance is Signal<any> {
		return typeof instance === 'function' && instance.set === set;
	},
};

export { Signal, signal };
