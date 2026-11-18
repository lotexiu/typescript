# `natives/math`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`MATH_LOCALES`](#math_locales) | constante | Messages of the errors thrown by `MathUtils`. |
| [`TClamp`](#tclamp) | tipo | Bounds and fallback used when clamping. |
| [`MathUtils`](#mathutils) | classe | Number helpers: clamping, ranges, rounding, aggregates and interpolation. |

---

## `MATH_LOCALES`

constante · [src/natives/math/locale.ts:4](../../../src/natives/math/locale.ts#L4)

Messages of the errors thrown by `MathUtils`.

```ts
const MATH_LOCALES
```

### Estáticos

#### `"en-US": { unknown: 'Unkown math error', finite: 'Value must be finite', range: 'Value must be in range', invalid: 'Invalid value', notNan: 'Value cant be NaN', }`

#### `"pt-BR": { unknown: 'Erro matemático desconhecido', finite: 'O valor deve ser finito', range: 'O valor deve estar no intervalo', invalid: 'Valor inválido', notNan: 'O valor não pode ser NaN', }`

---

## `TClamp`

tipo · [src/natives/math/types.ts:2](../../../src/natives/math/types.ts#L2)

Bounds and fallback used when clamping.

```ts
type TClamp = { … }
```

### Propriedades

#### `default?: number`

Value used when the input is not a number.

#### `min?: number`

Lower bound.

#### `max?: number`

Upper bound.

---

## `MathUtils`

classe · [src/natives/math/utils.ts:5](../../../src/natives/math/utils.ts#L5)

Number helpers: clamping, ranges, rounding, aggregates and interpolation.

```ts
class MathUtils
```

### Estáticos

#### `static clamp(value: number, min?: number, max?: number): number`

Keeps `value` between `min` and `max`; a missing bound is not applied.

#### `static inRange(value: number, min: number, max: number, inclusive = true): boolean`

Whether `value` is between `min` and `max` (bounds included unless `inclusive` is false).

#### `static round(value: number, decimals: number): number`

Rounds to `decimals` decimal places.

#### `static sum(...values: number[]): number`

Sum of the values.

#### `static subtract(...values: number[]): number`

First value minus the others.

#### `static multiply(...values: number[]): number`

Product of the values.

#### `static divide(...values: number[]): number`

First value divided by the others, in order.

#### `static median(...values: number[]): number`

Middle value (average of the two middle ones for an even count).

#### `static average(...values: number[]): number`

Arithmetic mean.

#### `static normalize(min: number, max: number, ...values: number[])`

Maps each value from `[min, max]` to `[0, 1]`.

#### `static map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number`

Maps `value` from one range to another, linearly (not clamped).

#### `static lerp(start: number, stop: number, amount: number): number`

Value between `start` and `stop` at `amount` (0 → start, 1 → stop).

#### `static random(min: number, max: number, integer = false): number`

Random in `[min, max)` — `max` is exclusive, also with `integer = true` (`random(0, 3, true)` yields 0, 1 or 2).
