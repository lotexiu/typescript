# `natives/async`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TimeoutError`](#timeouterror) | classe | Thrown (and used as the abort reason) by `AsyncUtils.timeout` when the work takes too long. |
| [`AsyncUtils`](#asyncutils) | classe | Promise helpers: waiting, time limits, retries and bounded concurrency. |

---

## `TimeoutError`

classe · [src/natives/async/error.ts:2](../../../src/natives/async/error.ts#L2)

Thrown (and used as the abort reason) by `AsyncUtils.timeout` when the work takes too long.

```ts
class TimeoutError extends Error
```

Estende `Error`.

### Construtor

#### `constructor(readonly ms: number)`

Builds the error for a limit of `ms` milliseconds (kept in `ms`).

### Propriedades

#### `override readonly name = 'TimeoutError'`

Always `'TimeoutError'`, so it can be told apart without `instanceof`.

---

## `AsyncUtils`

classe · [src/natives/async/utils.ts:4](../../../src/natives/async/utils.ts#L4)

Promise helpers: waiting, time limits, retries and bounded concurrency.

```ts
class AsyncUtils
```

### Estáticos

#### `static sleep(ms: number): Promise<void>`

Resolves after `ms` milliseconds.

#### `static timeout<T>(work: Promise<T> | ((signal: AbortSignal) => Promise<T>), ms: number): Promise<T>`

Falha com `TimeoutError` se o trabalho passar de `ms`. Se receber uma função, ela ganha um `AbortSignal` que é abortado
no estouro (para cancelar `fetch` etc.); se receber uma promessa, ela segue rodando — só o resultado é descartado.

#### `static async retry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T>`

Calls `fn` until it resolves, up to `retries` extra attempts, waiting `delayMs` before the first retry and doubling the wait each time. Rethrows the last error.

#### `static async mapConcurrent<T, R>( items: readonly T[], concurrency: number, fn: (item: T) => Promise<R> ): Promise<R[]>`

Maps `items` through an async `fn` with at most `concurrency` calls running at once. Results keep the input order.
