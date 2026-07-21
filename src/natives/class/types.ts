import { TAbstractConstructor } from "@tsn-function/types";

/** The shape of an object exposing a `constructor: TConstructor<T>`. */
type TPrototype<T> = {
	constructor: TAbstractConstructor<T>;
};

/** A constructable, class-like type — `TConstructor<T>` intersected with `Function`/`NewableFunction`. */
type TClazz<T = null> = T extends null
	? TAbstractConstructor<any> & Function & NewableFunction
	: TAbstractConstructor<T> & Function & NewableFunction;

/** `TClazz<T>`, optionally merged with `E`'s shape — for typing subclassing/mixin-style extension. */
type TExtendClass<T, E> = E extends null
	? TClazz<T>
	: TClazz<T&E>

/** The constructor type of Node's `NodeJS.Timeout`. */
type TTimeout = TAbstractConstructor<NodeJS.Timeout>;

export type {
	TPrototype,
	TClazz,
	TExtendClass,
	TTimeout,
};
