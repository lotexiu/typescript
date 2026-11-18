import { TExclude } from '@tsn/types';

const _typeof = typeof '';

/** Strings `typeof` can return. */
type TTypeOfValue = typeof _typeof;

/** Wrapper types of the primitives. */
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

/** `null` or `undefined`. */
type TNil = null | undefined;

/** Falsy values. */
type TFalse = TNil | '' | 0 | false;

/** Falsy values plus empty object and array. */
type TEmpty = TFalse | {} | [];

/** `Result`, or `null`/`undefined` when `WeakType` can be one of them. */
type TNullPropagation<WeakType, Result> = Extract<WeakType, TNil> | Result;

/** The type or `null`/`undefined`. */
type TNullable<Type = null> = Type | TNil;

/** The type without `undefined`. */
type TNonUndefined<T> = TExclude<T, undefined>;

/** The type when it has keys, `never` otherwise. */
type TNotUnkown<T> = keyof T extends never ? never : T;

/** The type when it has no keys, `never` otherwise. */
type TUnkown<T> = keyof T extends never ? T : never;

/** `T` narrowed/cast to `T & U` when `T` is assignable to `U`, otherwise `never`. */
type TAs<T, U> = T extends U ? T & U : never;

/** `true` when `A` and `B` are exactly the same type. */
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
