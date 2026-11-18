# `chunk`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TChunkPosition`](#tchunkposition) | tipo | `[start, end)` indexes of a chunk. |
| [`ChunkUtils`](#chunkutils) | classe | Splits arrays into chunks, either copying them or returning only the index ranges. |

---

## `TChunkPosition`

tipo · [src/chunk/types.ts:4](../../src/chunk/types.ts#L4)

`[start, end)` indexes of a chunk.

```ts
type TChunkPosition = TPair<number,number>
```

---

## `ChunkUtils`

classe · [src/chunk/utils.ts:4](../../src/chunk/utils.ts#L4)

Splits arrays into chunks, either copying them or returning only the index ranges.

```ts
class ChunkUtils
```

### Estáticos

#### `static bySize<T>(array: readonly T[], size: number): T[][]`

Chunks of `size` items (the last may be shorter).

#### `static byWorkers<T>(array: readonly T[], workers: number): T[][]`

As many chunks as `workers`, as even as possible.

#### `static bySizeCompact<T>(array: readonly T[], size: number): TChunkPosition[]`

Index ranges of `bySize`, without copying.

#### `static byWorkersCompact<T>(array: readonly T[], workers: number): TChunkPosition[]`

Index ranges of `byWorkers`, without copying.
