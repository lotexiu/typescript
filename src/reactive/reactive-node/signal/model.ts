import { NODE } from '../declarations';
import { ReactiveNode } from '../model';
import { TEqual, TReactive, TWithNode } from '../types';
import { ReactiveNodeUtils } from '../utils';

const { set, update, notify, subscribe, dispose } = ReactiveNodeUtils;

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
	return instance;
}

type Signal<T> = TReactive<T> & {
	set(next: T): boolean;
	update(fn: (value: T) => T): boolean;
	notify(): void;
};
const Signal = {
	batch: <R>(fn: () => R): R => ReactiveNode.batch(fn),
	untracked: <R>(fn: () => R): R => ReactiveNode.untracked(fn),
	[Symbol.hasInstance]: (value: any): boolean => typeof value === 'function' && value.set === set,
};

export { Signal, signal };
