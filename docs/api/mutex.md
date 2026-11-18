# `mutex`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Mutex`](#mutex) | classe | Exclusão mútua assíncrona: um `Semaphore` de 1 permissão. |

---

## `Mutex`

classe · [src/mutex/model.ts:4](../../src/mutex/model.ts#L4)

Exclusão mútua assíncrona: um `Semaphore` de 1 permissão.

```ts
class Mutex extends Semaphore
```

Estende [`Semaphore`](semaphore.md#semaphore) — os membros herdados estão documentados lá.

### Construtor

#### `constructor()`

### Propriedades

#### `get locked(): boolean`

Whether someone holds the lock.
