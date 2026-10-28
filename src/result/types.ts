type TOk<T> = Readonly<{ ok: true; value: T }>;
type TErr<E> = Readonly<{ ok: false; error: E }>;

/** Erro como valor: `if (result.ok) result.value else result.error`. */
type TResult<T, E = Error> = TOk<T> | TErr<E>;

export type { TOk, TErr, TResult };
