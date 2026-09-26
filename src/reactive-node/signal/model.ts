import { NODE } from '../declarations';
import { ReactiveNode } from '../model';
import { TEqual, TSignal } from '../types';
import { ReactiveNodeUtils } from '../utils';

const { set, update, notify, subscribe, dispose } = ReactiveNodeUtils;

function signal<T>(initial: T, equal?: TEqual<T>): TSignal<T> {
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

const Signal = {
	batch: <R>(fn: () => R): R => ReactiveNode.batch(fn),
	untracked: <R>(fn: () => R): R => ReactiveNode.untracked(fn),
	[Symbol.hasInstance]: (value: any): boolean => typeof value === 'function' && value.set === set,
};

export { Signal, signal };
