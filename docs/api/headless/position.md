# `headless/position`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TRect`](#trect) | tipo | A rectangle in any coordinate space (usually viewport pixels). |
| [`TSize`](#tsize) | tipo | Width and height of the floating element. |
| [`TSide`](#tside) | tipo | Which side of the anchor the floating element sits on. |
| [`TAlignment`](#talignment) | tipo | How the floating element lines up with the anchor along the side: start edges, centers or end edges. |
| [`TPlacement`](#tplacement) | tipo | `side` or `side-alignment`, e.g. `'bottom'`, `'right-start'`. |
| [`TPositionOptions`](#tpositionoptions) | tipo | How to place a floating element next to its anchor. |
| [`TPositionResult`](#tpositionresult) | tipo | Where to put the floating element. |
| [`PositionUtils`](#positionutils) | classe | Where to put a floating element (popover, menu, tooltip, select list) next to an anchor, with flip and shift — pure geometry over rectangles, the same job Floating UI does. Measuring elements and applying `x`/`y` is the adapter's part. |

---

## `TRect`

tipo · [src/headless/position/types.ts:2](../../../src/headless/position/types.ts#L2)

A rectangle in any coordinate space (usually viewport pixels).

```ts
type TRect = { … }
```

### Propriedades

#### `readonly x: number`

Left edge.

#### `readonly y: number`

Top edge.

#### `readonly width: number`

Width.

#### `readonly height: number`

Height.

---

## `TSize`

tipo · [src/headless/position/types.ts:14](../../../src/headless/position/types.ts#L14)

Width and height of the floating element.

```ts
type TSize = { … }
```

### Propriedades

#### `readonly width: number`

Width.

#### `readonly height: number`

Height.

---

## `TSide`

tipo · [src/headless/position/types.ts:22](../../../src/headless/position/types.ts#L22)

Which side of the anchor the floating element sits on.

```ts
type TSide = 'top' | 'bottom' | 'left' | 'right'
```

---

## `TAlignment`

tipo · [src/headless/position/types.ts:25](../../../src/headless/position/types.ts#L25)

How the floating element lines up with the anchor along the side: start edges, centers or end edges.

```ts
type TAlignment = 'start' | 'center' | 'end'
```

---

## `TPlacement`

tipo · [src/headless/position/types.ts:28](../../../src/headless/position/types.ts#L28)

`side` or `side-alignment`, e.g. `'bottom'`, `'right-start'`.

```ts
type TPlacement = TSide | `${TSide}-${Exclude<TAlignment, 'center'>}`
```

---

## `TPositionOptions`

tipo · [src/headless/position/types.ts:31](../../../src/headless/position/types.ts#L31)

How to place a floating element next to its anchor.

```ts
type TPositionOptions = { … }
```

### Propriedades

#### `readonly placement?: TPlacement`

Where to try first. Default `'bottom'`.

#### `readonly offset?: number`

Gap between anchor and floating element, in the same unit as the rects. Default `0`.

#### `readonly flip?: boolean`

Move to the opposite side when the preferred one does not fit but the opposite does. Default `true`.

#### `readonly shift?: boolean`

Slide along the side to stay inside the boundary. Default `true`.

#### `readonly padding?: number`

Minimum distance kept from the boundary edges by `shift`. Default `0`.

#### `readonly arrowSize?: number`

Size of an arrow element, so its offset can be clamped away from the floating element's corners.

---

## `TPositionResult`

tipo · [src/headless/position/types.ts:47](../../../src/headless/position/types.ts#L47)

Where to put the floating element.

```ts
type TPositionResult = { … }
```

### Propriedades

#### `readonly x: number`

Left edge of the floating element.

#### `readonly y: number`

Top edge of the floating element.

#### `readonly placement: TPlacement`

The placement actually used (differs from the requested one after a flip).

#### `readonly side: TSide`

Side actually used.

#### `readonly arrow: number`

Arrow position along the floating element's edge, pointing at the anchor's center.

#### `readonly available: number`

Room left between the anchor and the boundary on the chosen side — e.g. a `max-height` for a list.

---

## `PositionUtils`

classe · [src/headless/position/utils.ts:8](../../../src/headless/position/utils.ts#L8)

Where to put a floating element (popover, menu, tooltip, select list) next to an anchor, with flip and shift —
pure geometry over rectangles, the same job Floating UI does. Measuring elements and applying `x`/`y` is the adapter's part.

```ts
class PositionUtils
```

### Estáticos

#### `static parse(placement: TPlacement): readonly [TSide, TAlignment]`

Splits `'right-start'` into `['right', 'start']`; a bare side is centered.

#### `static join(side: TSide, alignment: TAlignment): TPlacement`

Builds a placement from side and alignment (`center` gives the bare side).

#### `static isVertical(side: TSide): boolean`

Whether the side is `top` or `bottom`.

#### `static compute(anchor: TRect, floating: TSize, boundary: TRect, options: TPositionOptions = {}): TPositionResult`

Positions `floating` against `anchor` inside `boundary` (usually the viewport).

**Exemplo**

```ts
const { x, y, placement } = PositionUtils.compute(buttonRect, { width: 200, height: 300 }, viewport, { placement: 'bottom-start', offset: 4 })
```
