# `composables/active-index`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`ActiveIndex`](#activeindex) | tipo | Index arithmetic (next/prev, wraparound) over a list whose length can change — e.g. options narrowed by a text filter. Doesn't know what the list contains; resolving `activeIndex()` to an item is the caller's job. |
| [`ActiveIndex`](#activeindex) | constante | Methods shared by every instance (assigned to each one) and the `instanceof` check. |
| [`activeIndex`](#activeindex) | função | An index into a list of reactive length that stays valid when the list shrinks — the keyboard focus of a list. |
| [`TActiveIndexOptions`](#tactiveindexoptions) | tipo | Options of `activeIndex`. |

---

## `ActiveIndex`

tipo · [src/composables/active-index/model.ts:16](../../../src/composables/active-index/model.ts#L16)

Index arithmetic (next/prev, wraparound) over a list whose length can change —
e.g. options narrowed by a text filter. Doesn't know what the list contains;
resolving `activeIndex()` to an item is the caller's job.

The value read is always inside `[0, length)` or `-1`: if the list shrinks below
the stored index, the read is clamped to the last item.

```ts
type ActiveIndex = Computed<number> & {
	set: (value: number) => void;
	update(fn: (value: number) => number): void;
	next: () => void;
	prev: () => void;
	reset: () => void;
}
```

---

## `ActiveIndex`

constante · [src/composables/active-index/model.ts:24](../../../src/composables/active-index/model.ts#L24)

Methods shared by every instance (assigned to each one) and the `instanceof` check.

```ts
const ActiveIndex
```

---

## `activeIndex`

função · [src/composables/active-index/model.ts:84](../../../src/composables/active-index/model.ts#L84)

An index into a list of reactive length that stays valid when the list shrinks — the keyboard focus of a list.

```ts
function activeIndex(length: TReactive<number>, options: TActiveIndexOptions = {}): ActiveIndex
```

**Exemplo**

```ts
const focused = activeIndex(computed(() => items().length), { wrap: false })
focused.next()
```

---

## `TActiveIndexOptions`

tipo · [src/composables/active-index/types.ts:15](../../../src/composables/active-index/types.ts#L15)

Options of `activeIndex`.

```ts
type TActiveIndexOptions = { … }
```

### Propriedades

#### `wrap?: boolean`

`true` (default): moving past either end wraps around. `false`: stops at the ends.
