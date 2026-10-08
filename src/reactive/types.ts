import { TUpdateFn } from "@tsn-function/types";

type TReactiveSet<T> = (value: T) => boolean;

type TReactiveUpdate<T> = (fn: TUpdateFn<T>) => boolean;

export { TReactiveSet, TReactiveUpdate };
