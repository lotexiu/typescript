import { TFunction, TRebindedFunction } from "./types";

function rebind<T extends TFunction>(
	fn: T,
	context: any,
	...initialArgs: any[]
): TRebindedFunction<T> {
	const originalFn: TFunction = fn.fn || fn;
	const previousArgs: any[] = [...(fn.args || []), ...initialArgs];
	const newFn = function (this: any, ...args: any[]) {
		return originalFn.apply(context, [...previousArgs, ...args]);
	};
	newFn.fn = originalFn;
	newFn.args = previousArgs;
	return newFn as any;
}

export const _Function = {
	rebind,
};

export type TUtilsFunction = typeof _Function;
