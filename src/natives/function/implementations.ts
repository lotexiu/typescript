import { TBindFn, TFn, TFnDeclaration, TParameters } from "./types";

/**
 * @internal
*/
class _Function {
	/** Wraps `fn` so its `this` is passed as an explicit leading parameter instead of the calling context. */
	static thisAsParameter<T extends TFn>(fn: T): TFnDeclaration<T> {
		return function (this: any, ...args: any[]): any {
			return fn.call(null, this, ...args);
		} as any;
	}

	static rebind<
		Applied extends any[],
		Rest extends any[],
		Return
	>(fn: TFn<[...Applied, ...Rest], Return>, thisArg: any, ...args: Applied): TFn<Rest, Return> {
		function rebinded(...nextArgs: Rest): Return {
				return rebinded.children.call(thisArg, ...args, ...nextArgs)
		}
		rebinded.origin = fn.origin ?? fn;
		rebinded.children = fn as TFn;
		return rebinded as any;
	}
};

export {
	_Function,
}
