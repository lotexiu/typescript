import { NODE } from "../declarations";
import { ReactiveNode } from "../model";
import { TComputed, TEqual } from "../types";
import { ReactiveNodeUtils } from "../utils";


const { set, subscribe, dispose } = ReactiveNodeUtils;

function computed<T>(compute: () => T, equal?: TEqual<T>): TComputed<T> {
	const node = ReactiveNode.computed(compute, equal);
	const instance: any = () => node.read();
	instance[NODE] = node;
	instance.subscribe = subscribe;
	instance.dispose = dispose;
	return instance;
}

const Computed = {
	[Symbol.hasInstance]: (value: any): boolean =>
		typeof value === 'function' && value[NODE] !== undefined && value.set !== set,
};

export { Computed, computed };
