
type TReactiveSet<T> = (value: T) => boolean;

type TReactiveUpdate<T> = (fn: (value: T) => T) => boolean;

export { TReactiveSet, TReactiveUpdate };
