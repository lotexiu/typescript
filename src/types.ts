import { TExclude } from '@tsn/types';

const _typeof = typeof '';

type TTypeOfValue = typeof _typeof;

type TPrimitiveTypes =
	| String
	| Number
	| Boolean
	| BigInt
	| Symbol
	| Function
	| null
	| undefined
	| object
	| readonly any[];

type TNil = null | undefined;

type TFalse = TNil | '' | 0 | false;

type TEmpty = TFalse | {} | [];

type TNullPropagation<WeakType, Result> = Extract<WeakType, TNil> | Result;

type TNullable<Type = null> = Type | TNil;

type TNonUndefined<T> = TExclude<T, undefined>;

type TNotUnkown<T> = keyof T extends never ? never : T;

type TUnkown<T> = keyof T extends never ? T : never;

/** `T` narrowed/cast to `T & U` when `T` is assignable to `U`, otherwise `never`. */
type TAs<T, U> = T extends U ? T & U : never;

type TEquals<A, B> =
	A extends B ?
		B extends A ?
			true
		:	false
	:	false;

export {
	TTypeOfValue,
	TPrimitiveTypes,
	TNil,
	TFalse,
	TEmpty,
	TNullPropagation,
	TNullable,
	TNonUndefined,
	TNotUnkown,
	TUnkown,
	TAs,
	TEquals,
};
