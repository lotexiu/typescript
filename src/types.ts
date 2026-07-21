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
			? A
			: never
		: never

type TUnionToIntersection<U> = 
  (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never

type TLastOf<U> = U extends any ? () => U : never
  // TUnionToIntersection<U extends any ? () => U : never> //extends () => infer L ? L : never

type TUnionToList<U, Last = TLastOf<U>> =
  [U] extends [never]
    ? []
    : [...TUnionToList<Exclude<U, Last>>, Last]

type Test = TLastOf<{a:1}|{b:2}>

type R = (() => 'a') & (() => 'b') & (() => 'c') extends () => infer L ? L : never


// type Test = 
// 	(() => {a: 1;}) & 
// 	(() => {b: 2;})

export type {
	TNullable,
	TNotUndefined,
	TTypeOfValue,
	TAs,
	TUnkown,
	TSameType,
};
