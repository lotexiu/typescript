# `theme/color`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TColor`](#tcolor) | tipo | The color object `Palette.get` returns — re-exported so consumers don't need `colorjs.io` just to type it. |
| [`TColorFormat`](#tcolorformat) | tipo | Text formats `ColorUtils.toString` can produce. |
| [`TContrastMetric`](#tcontrastmetric) | tipo | How "readable one color is over another" becomes a number — bigger is more readable. `WCAG21` is `1..21`, `APCA` is `Lc` (`0..~108`); thresholds are only comparable within the same metric. A function plugs in any other. |
| [`ColorUtils`](#colorutils) | classe | Thin layer over `colorjs.io` — keeps the dependency behind one door and covers what palettes need every time: turning a `TColor` into a string that is safe to use (always in sRGB gamut by default). |

---

## `TColor`

tipo · [src/theme/color/types.ts:4](../../../src/theme/color/types.ts#L4)

The color object `Palette.get` returns — re-exported so consumers don't need `colorjs.io` just to type it.

```ts
type TColor = Color
```

---

## `TColorFormat`

tipo · [src/theme/color/types.ts:7](../../../src/theme/color/types.ts#L7)

Text formats `ColorUtils.toString` can produce.

```ts
type TColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch' | 'p3'
```

---

## `TContrastMetric`

tipo · [src/theme/color/types.ts:13](../../../src/theme/color/types.ts#L13)

How "readable one color is over another" becomes a number — bigger is more readable. `WCAG21` is `1..21`,
`APCA` is `Lc` (`0..~108`); thresholds are only comparable within the same metric. A function plugs in any other.

```ts
type TContrastMetric = 'WCAG21' | 'APCA' | ((foreground: TColor, background: TColor) => number)
```

---

## `ColorUtils`

classe · [src/theme/color/utils.ts:7](../../../src/theme/color/utils.ts#L7)

Thin layer over `colorjs.io` — keeps the dependency behind one door and covers what palettes
need every time: turning a `TColor` into a string that is safe to use (always in sRGB gamut by default).

```ts
class ColorUtils
```

### Estáticos

#### `static toHex(color: TColor, alpha = 1): string`

`#rrggbb`, or `#rrggbbaa` when `alpha < 1`. Out-of-gamut colors are gamut-mapped, not clipped.

#### `static toString(color: TColor, format: TColorFormat = 'rgb'): string`

Same color as a CSS-style string in the given format (default `rgb`).

#### `static withAlpha(color: TColor, alpha: number): TColor`

Copy of `color` with the given alpha (`0..1`).

#### `static contrast(foreground: TColor, background: TColor, metric: TContrastMetric = 'WCAG21'): number`

Contrast of `foreground` over `background` by `metric` (default WCAG 2.1, `1..21`). APCA is polarity-aware, so order matters there; its sign is dropped.

#### `static mix(from: TColor, to: TColor, amount = 0.5, space = 'oklch'): TColor`

Interpolation between two colors (`amount` `0..1`) in a perceptual space.
