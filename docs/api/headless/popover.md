# `headless/popover`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Popover`](#popover) | classe | A non-modal `Dialog` anchored to another element, closed by a click outside by default, that also keeps the computed position. The adapter measures anchor and content, calls `place`, and applies `position()`. |
| [`TPopoverOptions`](#tpopoveroptions) | tipo | Options of a `Popover`: dialog options plus positioning. |

---

## `Popover`

classe · [src/headless/popover/model.ts:12](../../../src/headless/popover/model.ts#L12)

A non-modal `Dialog` anchored to another element, closed by a click outside by default, that also keeps the
computed position. The adapter measures anchor and content, calls `place`, and applies `position()`.

```ts
class Popover extends Dialog
```

Estende [`Dialog`](dialog.md#dialog) — os membros herdados estão documentados lá.

### Construtor

#### `constructor(options: TPopoverOptions = {})`

### Propriedades

#### `readonly positionOptions: TPositionOptions`

Placement, offset, flip and shift used by `place`.

#### `readonly position: Signal<TPositionResult | undefined>`

Last computed position; `undefined` until `place` runs.

### Métodos

#### `place(anchor: TRect, floating: TSize, boundary: TRect): TPositionResult`

Computes and stores the position from the measured anchor, content size and boundary (usually the viewport).

---

## `TPopoverOptions`

tipo · [src/headless/popover/types.ts:5](../../../src/headless/popover/types.ts#L5)

Options of a `Popover`: dialog options plus positioning.

```ts
type TPopoverOptions = TDialogOptions & TPositionOptions
```
