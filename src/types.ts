const _typeof = typeof "";

/** The literal union of every possible result of the `typeof` operator (`"string"`, `"number"`, etc). */
type TTypeOfValue = typeof _typeof;

/** `Type` widened with `undefined`/`null` (and `void`, unless `NoVoid` is `true`). */
type TNullable<
	Type = null,
	NoVoid extends boolean = false,
> = NoVoid extends false
	? Type | undefined | null | void
	: Type | undefined | null;

/** `T` with `undefined` excluded from the union. */
type TNotUndefined<T> = T extends undefined ? never : T;

/** `T` narrowed/cast to `T & U` when `T` is assignable to `U`, otherwise `never`. */
type TAs<T, U> = T extends U ? T & U : never;

/** `T` itself if it has no known keys (e.g. `unknown`, `{}`), otherwise `never`. */
type TUnkown<T> = keyof T extends never ? T : never;

/** `A` if `A` and `B` are structurally identical (mutually assignable), otherwise `never`. */
type TSameType<A,B> =
	A extends B
		? B extends A
			? true
			: false
		: false

export type {
	TNullable,
	TNotUndefined,
	TTypeOfValue,
	TAs,
	TUnkown,
	TSameType,
};