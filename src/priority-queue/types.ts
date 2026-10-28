/** Negativo → `a` sai antes; positivo → `b` sai antes (como `Array.sort`). */
type TCompare<T> = (a: T, b: T) => number;

/** @internal Item + ordem de chegada (desempate estável). */
type TEntry<T> = { item: T; order: number };

export type { TCompare, TEntry };
