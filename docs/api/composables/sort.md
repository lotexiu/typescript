# `composables/sort`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`sort`](#sort) | função | Sort state of a table: a key and a direction. Toggling the same key flips the direction; another key starts over. |
| [`TSortDirection`](#tsortdirection) | tipo | Ascending or descending. |
| [`TSortConfig`](#tsortconfig) | tipo | Initial state of `sort`. |
| [`TSort`](#tsort) | tipo | What `sort` returns. |

---

## `sort`

função · [src/composables/sort/model.ts:7](../../../src/composables/sort/model.ts#L7)

Sort state of a table: a key and a direction. Toggling the same key flips the direction; another key starts over.

```ts
function sort<K>(config: TSortConfig<K> = {}): TSort<K>
```

---

## `TSortDirection`

tipo · [src/composables/sort/types.ts:4](../../../src/composables/sort/types.ts#L4)

Ascending or descending.

```ts
type TSortDirection = 'ASC' | 'DESC'
```

---

## `TSortConfig`

tipo · [src/composables/sort/types.ts:7](../../../src/composables/sort/types.ts#L7)

Initial state of `sort`.

```ts
type TSortConfig<K> = { … }
```

### Propriedades

#### `initialKey?: K`

Key sorted at first.

#### `initialDirection?: TSortDirection`

Direction a key starts at when it's newly picked (by `toggle`, on a key that wasn't already active). Default `'ASC'`.

---

## `TSort`

tipo · [src/composables/sort/types.ts:15](../../../src/composables/sort/types.ts#L15)

What `sort` returns.

```ts
type TSort<K> = { … }
```

### Propriedades

#### `key: Signal<K | undefined>`

Sorted key, or `undefined`.

#### `direction: Signal<TSortDirection>`

Current direction.

### Métodos

#### `toggle(key: K): void`

Same key as `key()` -> flips `direction`. Different key -> switches to it at `initialDirection`.

#### `clear(): void`

Back to unsorted.
