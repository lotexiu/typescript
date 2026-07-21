import { TArrayOf, TArrayRest } from "@tsn-array/types";

type TFnOption = {
	args?: any[]
	infAs?: any
	returnType: any
}

/** Generic function-type shape, parameterized by argument list/inference target/return type — the base other function-type utilities here build on. */
type TFn<Option extends TFnOption = TFnOption> = (
	...args: TArrayOf<{args: Option['args'], infAs: Option['infAs']}>
) => Option['returnType']

/** Rewrites a function type with a leading "this-like" parameter into a method declaration with an explicit `this: V` parameter (used to type `thisAsParameter`-wrapped functions). */
type TFnDeclaration<T extends TFn> =
	T extends (value: infer This, ...args: infer Args) => infer R
		? <V extends This>(this: V, ...args: Args) => R
		: never

type R = (str: string, splitStr: string) => string

type R2 = TFnDeclaration<R>

/* 
Type 
<V extends string>(this: V, splitStr: string) => string' 
<V extends unknown>(this: V, ...args: unknown[]) => unknown'.

  Types of parameters 'splitStr' and 'args' are incompatible.
    Type 'unknown' is not assignable to type 'string'.
types.ts(5, 88): The expected type comes from property 'capitalizeAll' which is declared here on type 'TargetImpl<StringConstructor>' 
*/

// Questionando utilidade de TBindFnOption
type TBindFnOption = {
	fn: TFn | TBindFn
	context: any
	args: any[]
}

/** Callable shape returned by `_Function.rebind` — carries the original `fn`, the bound `context`, and the accumulated `args` alongside the callable signature. */
type TBindFn<Option extends TBindFnOption = TBindFnOption> = {
	(...args: TArrayRest<TParameters<Option['fn']>, Option['args']>): TReturnType<Option['fn']>
	fn: TFn
	context: Option['context']
	args: Option['args']
}

/** `Fn`'s type with its parameter list replaced by `Args`, keeping its original return type. */
type TModifyFnParameters<Fn extends TFn, Args extends any[]> =
	Fn extends (...args: any[]) => infer ReturnType
		? (...args: Args) => ReturnType
		: never;

/** `Fn`'s type with its return type replaced by `ReturnType`, keeping its original parameters. */
type TModifyFnReturn<Fn extends TFn, ReturnType> =
	Fn extends (...args: infer Args) => any
		? (...args: Args) => ReturnType
		: never;

/** Extracts a function type's parameter tuple (tolerates non-function `T`, resolving to `never` instead of requiring `(...args: any) => any`). */
type TParameters<T> = T extends (...args: infer P) => any ? P : never;

/** Extracts a function type's return type — thin alias over the built-in `ReturnType`. */
type TReturnType<T extends (...args: any) => any> = ReturnType<T>;

/** An abstract constructor type shape: `abstract new (...args: Args) => T`. */
type TConstructor<
	T = any,
	Args extends any[] = any[]
> = abstract new (...args: Args) => T;

/** Splits a constructor type into its `{ instance, parameters }` shape. */
type TConstructorInfo<T> =
	T extends TConstructor<infer I, infer P>
		? {instance: I, parameters: P}
		: never;

/** Extracts a constructor type's parameter tuple. */
type TConstructorParameters<T> =
	T extends TConstructor<any, infer P>
		? P
		: never;

/** Extracts a constructor type's instance type — thin alias over the built-in `InstanceType`. */
type TInstanceType<T extends abstract new (...args: any) => any> =
	InstanceType<T>;

export {
	TFn,
	TFnDeclaration,
	TBindFn,
	TModifyFnParameters,
	TModifyFnReturn,
	TParameters,
	TReturnType,
	TInstanceType,
	TConstructor,
	TConstructorInfo,
	TConstructorParameters,
};
