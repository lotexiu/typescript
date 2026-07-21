import { TBindFn, TFn, TFnDeclaration, TParameters } from "./types";

/**
 * @internal
*/
class _Function {
	static thisAsParameter<T extends TFn>(fn: T): TFnDeclaration<T> {
		return function (this: any, ...args: any[]): any {
			return fn.call(null, this, ...args);
		} as any;
	}

	static negate<T extends TFn>(fn: T) {
		function newFn(this: any, ...args: TParameters<T>) {
			return !fn.apply(this, args);
		}
		newFn.fn = fn;
		return newFn
	}

	/**
	 * Cria uma nova função com `this` e argumentos pré-aplicados fixos.
	 * Rebinding em cima de uma função já rebindada acumula os argumentos
	 * (não empilha wrappers) — `fn.fn` sempre aponta pra função original.
	 */
	static rebind<T extends TFn>(fn: T, context: any, ...args: any[]): TBindFn<{ fn: T; context: any; args: any[] }> {
		const originalFn: TFn = (fn as any).fn ?? fn;
		const boundArgs: any[] = [...((fn as any).args ?? []), ...args];

		function newFn(this: any, ...callArgs: any[]) {
			return originalFn.apply(context, [...boundArgs, ...callArgs]);
		}
		newFn.fn = originalFn;
		newFn.context = context;
		newFn.args = boundArgs;

		return newFn as any;
	}
};

/** The static shape of the internal `_Function` implementation — used to type the `Function.prototype` extensions wired up in `declarations.ts`. */
type TUFunction = typeof _Function;

export {
	_Function,
	TUFunction,
}
