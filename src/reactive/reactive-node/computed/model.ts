import { NODE } from '@tsr-node/declarations';
import { ReactiveNode } from '@tsr-node/model';
import { TEqual, TReactive } from '@tsr-node/types';
import { ReactiveNodeUtils } from '@tsr-node/utils';

const { set, subscribe, dispose } = ReactiveNodeUtils;

function computed<T>(compute: () => T, equal?: TEqual<T>): Computed<T> {
	const node = ReactiveNode.computed(compute, equal);
	const instance: any = () => node.read();
	instance[NODE] = node;
	instance.subscribe = subscribe;
	instance.dispose = dispose;
	return instance;
}

type Computed<T> = TReactive<T>;
const Computed = {
	[Symbol.hasInstance]: (value: any): boolean =>
		typeof value === 'function' && value[NODE] !== undefined && value.set !== set,
};

export { Computed, computed };
