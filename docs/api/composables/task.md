# `composables/task`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`task`](#task) | função | An async function as state: `run` (debounced), `data`, `loading` and `error`. Results of older runs are dropped when a newer run starts. |

---

## `task`

função · [src/composables/task/model.ts:8](../../../src/composables/task/model.ts#L8)

An async function as state: `run` (debounced), `data`, `loading` and `error`. Results of older runs are dropped when a newer run starts.

```ts
function task<Args extends any[], T, E = unknown>( fn: TFn<Args, Promise<T>>, debounceValue = 0 )
```

Estende `any`.
