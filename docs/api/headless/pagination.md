# `headless/pagination`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Pagination`](#pagination) | classe | Current page over a number of items, with the page list to render and the slice of items to show. |
| [`TPaginationPage`](#tpaginationpage) | tipo | A page button in the page list. |
| [`TPaginationEllipsis`](#tpaginationellipsis) | tipo | A gap in the page list ("…"). |
| [`TPaginationItem`](#tpaginationitem) | tipo | An entry of the page list: a page or a gap. |
| [`TPaginationOptions`](#tpaginationoptions) | tipo | Options of a `Pagination`. The value is the current page, from 1. |
| [`PaginationUtils`](#paginationutils) | classe | Pure page arithmetic and the list of page buttons with gaps. |

---

## `Pagination`

classe · [src/headless/pagination/model.ts:19](../../../src/headless/pagination/model.ts#L19)

Current page over a number of items, with the page list to render and the slice of items to show.

Anatomy: `parts.previous()`, `parts.next()` on the arrows, `parts.page(n)` on each page button (`aria-current`).

```ts
class Pagination extends Control<number>
```

Estende [`Control`](control.md#control) — os membros herdados estão documentados lá.

**Exemplo**

```ts
const pages = new Pagination({ total: rows.length, pageSize: 20 })
rows.slice(pages.start(), pages.end())
```

### Construtor

#### `constructor(options: TPaginationOptions)`

### Propriedades

#### `readonly total: TReactive<number>`

Number of items.

#### `readonly pageSize: TReactive<number>`

Items per page.

#### `readonly pageCount: Computed<number>`

Number of pages.

#### `readonly page: Computed<number>`

Current page, always valid even when `total` shrinks.

#### `readonly items: Computed<readonly TPaginationItem[]>`

The page buttons and gaps to render.

#### `readonly canPrevious: Computed<boolean>`

There is a page before.

#### `readonly canNext: Computed<boolean>`

There is a page after.

#### `readonly start: Computed<number>`

Index of the first item of the current page.

#### `readonly end: Computed<number>`

Index after the last item of the current page (for `slice`).

### Métodos

#### `goTo(page: number): boolean`

Goes to a page (rounded and clamped).

#### `next(): boolean`

Goes to the next page.

#### `previous(): boolean`

Goes to the previous page.

#### `first(): boolean`

Goes to page 1.

#### `last(): boolean`

Goes to the last page.

#### `parts.previous(): TAttributes`

#### `parts.next(): TAttributes`

#### `parts.page(page: number): TAttributes`

---

## `TPaginationPage`

tipo · [src/headless/pagination/types.ts:5](../../../src/headless/pagination/types.ts#L5)

A page button in the page list.

```ts
type TPaginationPage = { … }
```

### Propriedades

#### `readonly type: 'page'`

Discriminant.

#### `readonly page: number`

Page number, from 1.

#### `readonly current: boolean`

This is the current page.

---

## `TPaginationEllipsis`

tipo · [src/headless/pagination/types.ts:15](../../../src/headless/pagination/types.ts#L15)

A gap in the page list ("…").

```ts
type TPaginationEllipsis = { … }
```

### Propriedades

#### `readonly type: 'ellipsis'`

Discriminant.

#### `readonly position: 'start' | 'end'`

Whether the gap is before or after the current page.

---

## `TPaginationItem`

tipo · [src/headless/pagination/types.ts:23](../../../src/headless/pagination/types.ts#L23)

An entry of the page list: a page or a gap.

```ts
type TPaginationItem = TPaginationPage | TPaginationEllipsis
```

---

## `TPaginationOptions`

tipo · [src/headless/pagination/types.ts:26](../../../src/headless/pagination/types.ts#L26)

Options of a `Pagination`. The value is the current page, from 1.

```ts
type TPaginationOptions = TControlOptions<number> & {
	/** Number of items being paged (not pages). Static or reactive. */
	readonly total: TMaybeReactive<number>;
	/** Items per page. Default 10. Static or reactive. */
	readonly pageSize?: TMaybeReactive<number>;
	/** Pages shown on each side of the current one. Default 1. */
	readonly siblings?: number;
	/** Pages always shown at each end. Default 1. */
	readonly boundaries?: number;
}
```

---

## `PaginationUtils`

classe · [src/headless/pagination/utils.ts:5](../../../src/headless/pagination/utils.ts#L5)

Pure page arithmetic and the list of page buttons with gaps.

```ts
class PaginationUtils
```

### Estáticos

#### `static pageCount(total: number, pageSize: number): number`

Number of pages; at least 1, even with no items.

#### `static clamp(page: number, pageCount: number): number`

Rounds a page number and keeps it inside `[1, pageCount]`.

#### `static pages(first: number, last: number): number[]`

Page numbers from `first` to `last`, inclusive.

#### `static items(page: number, pageCount: number, siblings: number, boundaries: number): TPaginationItem[]`

The page buttons to show: the ends, the current page with its siblings, and gaps between them.
The list keeps the same length while the current page moves, so the buttons do not jump around.

**Exemplo**

```ts
PaginationUtils.items(10, 20, 1, 1) // pages 1, …, 9, 10, 11, …, 20
```
