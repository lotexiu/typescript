# `theme/palette`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TONE_STOPS`](#tone_stops) | constante | Conventional tones (lightness in percent). Any number from 0 to 100 is accepted by `Palette.get`. |
| [`ON_COLOR_TONES`](#on_color_tones) | constante | Candidate tones for `Palette.onColor` — the darkest and the lightest the scale offers. |
| [`NEUTRAL_CHROMA`](#neutral_chroma) | constante | Default chroma of `Palette.neutral` — almost gray. |
| [`Palette`](#palette) | classe | Colors of one hue at every tone (0 = black, 100 = white). Subclasses decide how a tone becomes a color. |
| [`CustomPalette`](#custompalette) | classe | Palette defined by hand-picked colors per tone; tones in between are interpolated (in oklch) from the nearest picked ones. |
| [`TonalPalette`](#tonalpalette) | classe | A palette generated from one seed color: every tone keeps the seed's hue and chroma at another lightness (OKLCH). Tones are cached per seed; changing `seed` recomputes them. |
| [`PALETTES_TYPES`](#palettes_types) | constante | Ready palettes grouped by family (`Basic`, `Light`, `Dark`...). |
| [`TToneStops`](#ttonestops) | tipo | The conventional tone stops. |
| [`TToneStop`](#ttonestop) | tipo | One conventional tone stop. |
| [`TPaletteDerive`](#tpalettederive) | tipo | Recipe for `Palette.derive` — a new palette whose seed is this palette's mid tone, adjusted. |

---

## `TONE_STOPS`

constante · [src/theme/palette/declarations.ts:2](../../../src/theme/palette/declarations.ts#L2)

Conventional tones (lightness in percent). Any number from 0 to 100 is accepted by `Palette.get`.

```ts
const TONE_STOPS
```

---

## `ON_COLOR_TONES`

constante · [src/theme/palette/declarations.ts:5](../../../src/theme/palette/declarations.ts#L5)

Candidate tones for `Palette.onColor` — the darkest and the lightest the scale offers.

```ts
const ON_COLOR_TONES = [10, 100] as const
```

---

## `NEUTRAL_CHROMA`

constante · [src/theme/palette/declarations.ts:7](../../../src/theme/palette/declarations.ts#L7)

Default chroma of `Palette.neutral` — almost gray.

```ts
const NEUTRAL_CHROMA = 0.03
```

---

## `Palette`

classe · [src/theme/palette/model.ts:9](../../../src/theme/palette/model.ts#L9)

Colors of one hue at every tone (0 = black, 100 = white). Subclasses decide how a tone becomes a color.

```ts
class Palette
```

### Construtor

#### `constructor(name: string)`

### Propriedades

#### `readonly name: Signal<string>`

Display name.

### Métodos

#### `abstract get(toneStop: number): Color`

`toneStop` is any number in `0..100` (it is the lightness, in percent). The `TToneStop` values
are just the conventional stops — nothing between them is off-limits.

#### `rangeTo(toneStop: number, space: string | ColorSpace = 'srgb')`

The color of a tone mapped into a color space's gamut (default sRGB) and converted to it.

#### `opposite(value: number | Color): TToneStop`

The tone stop mirrored around 50 (`10` → `90`), from a tone or from a color of this palette. For readable text use `onColor`.

#### `onColor(background: Color, candidates: readonly number[] = ON_COLOR_TONES): Color`

The tone of this palette that reads best on top of `background` (highest WCAG contrast among `candidates`,
by default the darkest and lightest tones). `opposite()` mirrors lightness; this one measures contrast.

#### `derive({ hueShift = 0, chromaScale = 1, chroma, name }: TPaletteDerive = {}): TonalPalette<Color>`

New tonal palette seeded from this one's mid tone — hue-shifted and/or re-saturated.

#### `neutral(chroma = NEUTRAL_CHROMA, name?: string): TonalPalette<Color>`

Same hue, almost no chroma — the usual base for backgrounds and surfaces.

#### `chroma(value: Color): TToneStop`

Tone stop of this palette whose chroma is closest to the color's.

#### `lightness(value: Color): TToneStop`

Tone stop of this palette whose lightness is closest to the color's.

---

## `CustomPalette`

classe · [src/theme/palette/model.ts:84](../../../src/theme/palette/model.ts#L84)

Palette defined by hand-picked colors per tone; tones in between are interpolated (in oklch) from the nearest picked ones.

```ts
class CustomPalette extends Palette
```

Estende [`Palette`](palette.md#palette) — os membros herdados estão documentados lá.

### Construtor

#### `constructor( name: string, public readonly seedTones: Record<number, string> )`

### Métodos

#### `get(toneStop: number): Color`

The color at a tone from 0 to 100 (tones between the defined ones are interpolated).

---

## `TonalPalette`

classe · [src/theme/palette/model.ts:123](../../../src/theme/palette/model.ts#L123)

A palette generated from one seed color: every tone keeps the seed's hue and chroma at another lightness (OKLCH).
Tones are cached per seed; changing `seed` recomputes them.

```ts
class TonalPalette<T extends ColorTypes = string, N extends string = string> extends Palette
```

Estende `ColorTypes`.

### Construtor

#### `constructor(seed: T, name: N)`

### Propriedades

#### `readonly seed: Signal<T>`

The seed color. Reactive: reading tones inside a `computed` tracks it.

### Métodos

#### `get(toneStop: number): Color`

The color at a tone from 0 to 100, keeping the seed's hue and chroma (cached until the seed changes).

---

## `PALETTES_TYPES`

constante · [src/theme/palette/presets.ts:98](../../../src/theme/palette/presets.ts#L98)

Ready palettes grouped by family (`Basic`, `Light`, `Dark`...).

```ts
const PALETTES_TYPES
```

### Estáticos

#### `Basic: BASIC`

#### `Light: LIGHT`

#### `Dark: DARK`

#### `Neon: NEON`

#### `Earth: EARTH`

#### `Pastel: PASTEL`

---

## `TToneStops`

tipo · [src/theme/palette/types.ts:4](../../../src/theme/palette/types.ts#L4)

The conventional tone stops.

```ts
type TToneStops = typeof TONE_STOPS
```

---

## `TToneStop`

tipo · [src/theme/palette/types.ts:6](../../../src/theme/palette/types.ts#L6)

One conventional tone stop.

```ts
type TToneStop = TToneStops[number]
```

---

## `TPaletteDerive`

tipo · [src/theme/palette/types.ts:9](../../../src/theme/palette/types.ts#L9)

Recipe for `Palette.derive` — a new palette whose seed is this palette's mid tone, adjusted.

```ts
type TPaletteDerive = { … }
```

### Propriedades

#### `hueShift?: number`

Degrees added to the hue (wraps at 360).

#### `chromaScale?: number`

Multiplies the chroma.

#### `chroma?: number`

Replaces the chroma (applied after `chromaScale`). Use a small value (~0.03) for neutrals.

#### `name?: string`

Defaults to this palette's name.
