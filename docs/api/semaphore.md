# `semaphore`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Semaphore`](#semaphore) | classe | Semáforo assíncrono, justo (FIFO): no máximo `permits` tarefas ao mesmo tempo. `run(fn)` garante a devolução mesmo se `fn` lançar. Vale **dentro de uma thread** (várias tarefas assíncronas pendentes); não protege nada entre workers — isso exigiria `SharedArrayBuffer` + `Atomics`. Aceita `AbortSignal`: quem está na fila e é cancelado sai dela e rejeita com `signal.reason`. |
| [`TRelease`](#trelease) | tipo | Devolve a permissão. Chamar de novo não faz nada (idempotente). |

---

## `Semaphore`

classe · [src/semaphore/model.ts:8](../../src/semaphore/model.ts#L8)

Semáforo assíncrono, justo (FIFO): no máximo `permits` tarefas ao mesmo tempo. `run(fn)` garante a devolução mesmo se `fn` lançar.
Vale **dentro de uma thread** (várias tarefas assíncronas pendentes); não protege nada entre workers — isso exigiria `SharedArrayBuffer` + `Atomics`.
Aceita `AbortSignal`: quem está na fila e é cancelado sai dela e rejeita com `signal.reason`.

```ts
class Semaphore
```

### Construtor

#### `constructor(permits: number)`

### Propriedades

#### `readonly permits: number`

How many holders may run at once.

#### `get available(): number`

Permissões livres agora.

#### `get pending(): number`

Quantos estão esperando.

### Métodos

#### `tryAcquire(): TRelease | undefined`

Pega uma permissão sem esperar; `undefined` se não houver.

#### `acquire(signal?: AbortSignal): Promise<TRelease>`

Waits for a permit (in arrival order). Resolves with the function that releases it; rejects if `signal` aborts first.

#### `async run<T>(fn: () => Promise<T> | T, signal?: AbortSignal): Promise<T>`

Runs `fn` holding a permit, releasing it afterwards even when `fn` throws.

---

## `TRelease`

tipo · [src/semaphore/types.ts:2](../../src/semaphore/types.ts#L2)

Devolve a permissão. Chamar de novo não faz nada (idempotente).

```ts
type TRelease = () => void
```
