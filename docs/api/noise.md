# `noise`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`ValueNoise`](#valuenoise) | classe | Smooth 2D value noise from a seed — the same seed always gives the same texture. Values are in `[0, 1]`. Use it for grain, clouds, terrain or organic motion; drawing it (canvas, SVG, shader) is the app's job. |
| [`TFractalOptions`](#tfractaloptions) | tipo | Layers of a fractal noise: each octave adds finer detail with less weight. |

---

## `ValueNoise`

classe · [src/noise/model.ts:12](../../src/noise/model.ts#L12)

Smooth 2D value noise from a seed — the same seed always gives the same texture. Values are in `[0, 1]`.
Use it for grain, clouds, terrain or organic motion; drawing it (canvas, SVG, shader) is the app's job.

```ts
class ValueNoise
```

**Exemplo**

```ts
const noise = new ValueNoise(42)
noise.at(1.5, 2.25) // e.g. 0.63
```

### Construtor

#### `constructor(seed?: number)`

### Métodos

#### `at(x: number, y: number): number`

Noise at a point; one unit is one cell of random values, smoothly blended.

#### `fractal(x: number, y: number, options: TFractalOptions = {}): number`

Several octaves of noise added together and normalized to `[0, 1]` — more natural detail.

---

## `TFractalOptions`

tipo · [src/noise/types.ts:2](../../src/noise/types.ts#L2)

Layers of a fractal noise: each octave adds finer detail with less weight.

```ts
type TFractalOptions = { … }
```

### Propriedades

#### `readonly octaves?: number`

Number of layers. Default 4.

#### `readonly lacunarity?: number`

Frequency multiplier per layer. Default 2.

#### `readonly gain?: number`

Weight multiplier per layer. Default 0.5.
