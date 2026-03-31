import { TFunction, TRebindedFunction } from "./types";

function originFn<T extends TFunction>(fn: T): TFunction | T {
	while (fn.fn) {
		fn = fn.fn as T;
	}
	return fn;
}

function rebind<T extends TFunction>(
	fn: T,
	context: any,
	...initialArgs: any[]
): TRebindedFunction<T> {
	const prevFn: TFunction = fn.fn || fn;
	const previousArgs: any[] = [...(fn.args || []), ...initialArgs];

	function newFn(this: any, ...args: any[]) {
		return prevFn.apply(context, [...previousArgs, ...args]);
	}

	newFn.fn = prevFn;
	newFn.args = previousArgs;
	return newFn as TRebindedFunction<T>;
}

function negate<T extends TFunction<any, boolean>>(
	fn: T,
): TRebindedFunction<T> {
	function newFn(this: any, ...args: any[]) {
		return !fn.apply(this, args);
	}
	newFn.fn = fn;
	newFn.args = fn.args;
	return newFn as TRebindedFunction<T>;
}

export const _Function = {
	rebind,
	negate,
};

export type TUtilsFunction = typeof _Function;
