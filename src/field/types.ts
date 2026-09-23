type TFieldGet<S, V> = (source: S) => V;

type TFieldSet<S, V> = (source: S, value: V) => void;

export { TFieldGet, TFieldSet };
