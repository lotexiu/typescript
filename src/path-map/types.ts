/** A `Map` nested one level per element of tuple `P`, bottoming out in a `T[]` bucket — the shape `PathMap`'s `root` follows. */
type TRecursiveMap<
	P extends any[],
	T
> = P extends [infer First, ...infer Rest]
  ? Map<
			First,
			Rest extends [] 
				? T[] 
				: TRecursiveMap<Rest, T>
		>
	: never;

export {
	TRecursiveMap,
}