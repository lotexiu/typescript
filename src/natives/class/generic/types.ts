type TConstructor<T = any> = new (...args: any[]) => T;

type TPrototype<T> = {
	constructor: TConstructor<T>;
};

type TClazz<T = null> = T extends null
	? TConstructor<any> & Function & NewableFunction
	: TConstructor<T> & Function & NewableFunction;

type TExtendClass<T, E> = E extends null
	? TClazz<T>
	: TClazz<T&E>

export type { TConstructor, TPrototype, TClazz, TExtendClass};
