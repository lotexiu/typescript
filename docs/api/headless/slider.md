# `headless/slider`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Slider`](#slider) | classe | A numeric value picked inside a range, by keyboard or pointer. |
| [`TRange`](#trange) | tipo | Bounds of a numeric value and the step it snaps to. |
| [`TSliderOptions`](#tslideroptions) | tipo | Options of a `Slider`. `min` 0, `max` 100 and `step` 1 by default. |
| [`SliderUtils`](#sliderutils) | classe | Pure math of a range: clamping, snapping to a step, and converting between value, ratio and pointer position. |

---

## `Slider`

classe · [src/headless/slider/model.ts:22](../../../src/headless/slider/model.ts#L22)

A numeric value picked inside a range, by keyboard or pointer.

Keyboard: arrows (Shift for a large step), PageUp/PageDown, Home/End. Pointer: call `pointerDown`/`pointerMove`/`pointerUp` with
the pointer's distance from the start of the track and the track length; the slider handles orientation and text direction.

Anatomy: `parts.root()` wrapper, `parts.track()`, `parts.range()` (the filled part, sized with `ratio()`), `parts.thumb()` (`role="slider"`, focusable).

```ts
class Slider extends Control<number>
```

Estende [`Control`](control.md#control) — os membros herdados estão documentados lá.

**Exemplo**

```ts
const volume = new Slider({ min: 0, max: 100, value: 30 })
<div {...volume.parts.thumb()} onKeyDown={volume.keydown} style={{ left: `${volume.ratio() * 100}%` }} />
```

### Construtor

#### `constructor(options: TSliderOptions = {})`

### Propriedades

#### `readonly range: TRange`

Bounds and step.

#### `readonly largeStep: number`

Distance for PageUp/PageDown and Shift+arrows.

#### `readonly orientation: TOrientation`

Axis of the track.

#### `readonly direction: TTextDirection`

Text direction; in `rtl` the right arrow decreases.

#### `readonly ratio: Computed<number>`

Position of the value in the range, from 0 to 1.

#### `readonly text: Computed<string>`

The value as text, through `format`.

#### `readonly dragging: Signal<boolean>`

True between `pointerDown` and `pointerUp`.

### Métodos

#### `increment(steps = 1): boolean`

Adds `steps` steps.

#### `decrement(steps = 1): boolean`

Subtracts `steps` steps.

#### `toMinimum(): boolean`

Goes to `min`.

#### `toMaximum(): boolean`

Goes to `max`.

#### `setRatio(ratio: number): boolean`

Sets the value at a ratio from 0 to 1.

#### `pointerDown(offset: number, length: number): boolean`

Starts a drag at a pointer position on the track and jumps there.

#### `pointerMove(offset: number, length: number): boolean`

Follows the pointer while dragging; does nothing otherwise.

#### `pointerUp(): void`

Ends the drag.

#### `parts.root(): TAttributes`

#### `parts.track(): TAttributes`

#### `parts.range(): TAttributes`

#### `parts.thumb(): TAttributes`

---

## `TRange`

tipo · [src/headless/slider/types.ts:5](../../../src/headless/slider/types.ts#L5)

Bounds of a numeric value and the step it snaps to.

```ts
type TRange = { … }
```

### Propriedades

#### `readonly min: number`

Smallest value.

#### `readonly max: number`

Largest value.

#### `readonly step?: number`

Values snap to `min + n * step`. Without it any value inside the range is kept.

---

## `TSliderOptions`

tipo · [src/headless/slider/types.ts:15](../../../src/headless/slider/types.ts#L15)

Options of a `Slider`. `min` 0, `max` 100 and `step` 1 by default.

```ts
type TSliderOptions = TControlOptions<number> &
Partial<TRange> & {
	/** Distance for PageUp/PageDown and Shift+arrows. Default `step * 10`. */
	readonly largeStep?: number;
	/** Default `horizontal`. */
	readonly orientation?: TOrientation;
	/** Default `ltr`. */
	readonly direction?: TTextDirection;
	/** Text read by screen readers for a value (`aria-valuetext`) and shown by `text`. Default `String`. */
	readonly format?: (value: number) => string;
}
```

---

## `SliderUtils`

classe · [src/headless/slider/utils.ts:8](../../../src/headless/slider/utils.ts#L8)

Pure math of a range: clamping, snapping to a step, and converting between value, ratio and pointer position.

```ts
class SliderUtils
```

### Estáticos

#### `static clamp(value: number, range: TRange): number`

Keeps `value` inside `[min, max]`.

#### `static normalize(value: number, range: TRange): number`

Clamps and snaps to the step, without floating point drift (`0.1 + 0.2` gives `0.3`).

#### `static ratio(value: number, range: TRange): number`

Where `value` sits in the range, from 0 to 1 — use it to position the thumb and fill the track.

#### `static fromRatio(ratio: number, range: TRange): number`

The normalized value at a ratio from 0 to 1.

#### `static pointerRatio(offset: number, length: number, orientation: TOrientation, direction: TTextDirection): number`

Ratio under the pointer, given its distance from the start edge of the track and the track length. Vertical sliders grow upwards; right-to-left ones grow leftwards.
