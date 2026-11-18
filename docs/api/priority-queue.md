# `priority-queue`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`PriorityQueue`](#priorityqueue) | classe | Fila de prioridade (heap binário). Sai primeiro o menor segundo `compare`; empates saem na **ordem de chegada** (estável). Base de agendadores, timers, Dijkstra/A*. `push`/`pop` custam O(log n), `peek` O(1). |
| [`TCompare`](#tcompare) | tipo | Negativo → `a` sai antes; positivo → `b` sai antes (como `Array.sort`). |

---

## `PriorityQueue`

classe · [src/priority-queue/model.ts:7](../../src/priority-queue/model.ts#L7)

Fila de prioridade (heap binário). Sai primeiro o menor segundo `compare`; empates saem na **ordem de chegada** (estável).
Base de agendadores, timers, Dijkstra/A*. `push`/`pop` custam O(log n), `peek` O(1).

```ts
class PriorityQueue<T>
```

### Construtor

#### `constructor(compare: TCompare<T>, items: Iterable<T> = [])`

### Propriedades

#### `get size(): number`

Number of items.

#### `get isEmpty(): boolean`

Whether it has no items.

### Métodos

#### `push(item: T): void`

Adds an item.

#### `peek(): T | undefined`

The next item, without removing it.

#### `pop(): T | undefined`

Removes and returns the next item (equal priorities come out in insertion order).

#### `clear(): void`

Removes every item.

#### `toSortedArray(): T[]`

Itens na ordem de saída; a fila não é alterada.

---

## `TCompare`

tipo · [src/priority-queue/types.ts:2](../../src/priority-queue/types.ts#L2)

Negativo → `a` sai antes; positivo → `b` sai antes (como `Array.sort`).

```ts
type TCompare<T> = (left: T, right: T) => number
```
