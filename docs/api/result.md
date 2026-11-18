# `result`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TOk`](#tok) | tipo | A success with its value. |
| [`TErr`](#terr) | tipo | A failure with its error. |
| [`TResult`](#tresult) | tipo | Erro como valor: `if (result.ok) result.value else result.error`. |
| [`ResultUtils`](#resultutils) | classe | Errors as values: build, transform and unwrap `{ ok, value \| error }` results. |

---

## `TOk`

tipo · [src/result/types.ts:2](../../src/result/types.ts#L2)

A success with its value.

```ts
type TOk<T> = Readonly<{ ok: true; value: T }>
```

---

## `TErr`

tipo · [src/result/types.ts:4](../../src/result/types.ts#L4)

A failure with its error.

```ts
type TErr<E> = Readonly<{ ok: false; error: E }>
```

---

## `TResult`

tipo · [src/result/types.ts:7](../../src/result/types.ts#L7)

Erro como valor: `if (result.ok) result.value else result.error`.

```ts
type TResult<T, E = Error> = TOk<T> | TErr<E>
```

---

## `ResultUtils`

classe · [src/result/utils.ts:4](../../src/result/utils.ts#L4)

Errors as values: build, transform and unwrap `{ ok, value | error }` results.

```ts
class ResultUtils
```

### Estáticos

#### `static toError(thrown: unknown): Error`

O que foi lançado, sempre como `Error` (texto/objeto viram `Error` com `cause`).

#### `static ok<T>(value: T): TOk<T>`

A success.

#### `static err<E>(error: E): TErr<E>`

A failure.

#### `static attempt<T>(fn: () => T): TResult<T>`

Executa `fn`; o que ela lançar vira `{ ok: false, error }` (sempre um `Error`).

#### `static async attemptAsync<T>(fn: () => Promise<T>): Promise<TResult<T>>`

Awaits `fn`; a rejection becomes a failure instead of an exception.

#### `static map<T, U, E>(result: TResult<T, E>, fn: (value: T) => U): TResult<U, E>`

Transforms the value of a success; failures pass through.

#### `static mapError<T, E, F>(result: TResult<T, E>, fn: (error: E) => F): TResult<T, F>`

Transforms the error of a failure; successes pass through.

#### `static unwrapOr<T, E>(result: TResult<T, E>, fallback: T): T`

The value of a success, or `fallback`.

#### `static unwrap<T, E>(result: TResult<T, E>): T`

Valor, ou lança o erro (um `Error` é relançado como está).
