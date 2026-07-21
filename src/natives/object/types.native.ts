import type { TExtract } from "@tsn/types";

/**
 * Makes all properties of T required.
 *
 * @example
 * type RequiredExample = _Required<{ a?: number; b?: string }>; // { a: number; b: string }
 */
type TRequired<T> = Required<T>;

/**
 * Makes all properties of T readonly.
 *
 * @example
 * type ReadonlyExample = _Readonly<{ a: number; b?: string }>; // { readonly a: number; readonly b: string }
 */
type TReadonly<T> = Readonly<T>;

/**
 * From T, picks a set of properties whose keys are in the union K.
 *
 * @example
 * type PickExample = _Pick<{ a: number; b: string }, 'a'>; // { a: number }
 */
type TPick<T, KeyType> = {
	[K in keyof T as K extends KeyType ? K : never]: T[K];
};

/**
 * Constructs a type with the properties of T except for those in type K.
 *
 * @example
 * type OmitExample = _Omit<{ a: number; b: string }, 'a'>; // { b: string }
 */
type TOmit<T, K extends keyof any> = Omit<T, K>;

/**
 * Makes all properties of T optional.
 *
 * @example
 * type PartialExample = _Partial<{ a: number; b: string }>; // { a?: number; b?: string }
 */
type TPartial<T> = Partial<T>;

export type {
	TRequired as TRequired,
	TReadonly as TReadonly,
	TPick as TPick,
	TOmit as TOmit,
	TPartial as TPartial,
};
