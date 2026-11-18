# `motion/easing`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TEasing`](#teasing) | tipo | Maps linear progress (0 → 1) to eased progress. May overshoot for springy curves. |
| [`EasingUtils`](#easingutils) | classe | Easing curves for animations: the classic cubic ones and any CSS-like cubic Bézier. |

---

## `TEasing`

tipo · [src/motion/easing/types.ts:2](../../../src/motion/easing/types.ts#L2)

Maps linear progress (0 → 1) to eased progress. May overshoot for springy curves.

```ts
type TEasing = (progress: number) => number
```

---

## `EasingUtils`

classe · [src/motion/easing/utils.ts:5](../../../src/motion/easing/utils.ts#L5)

Easing curves for animations: the classic cubic ones and any CSS-like cubic Bézier.

```ts
class EasingUtils
```

### Estáticos

#### `static linear(progress: number): number`

No easing.

#### `static easeIn(progress: number): number`

Starts slow, ends fast.

#### `static easeOut(progress: number): number`

Starts fast, ends slow — the usual choice for things entering the screen.

#### `static easeInOut(progress: number): number`

Slow at both ends.

#### `static cubicBezier(x1: number, y1: number, x2: number, y2: number): TEasing`

The curve of `cubic-bezier(x1, y1, x2, y2)`: control points `(x1, y1)` and `(x2, y2)` between `(0, 0)` and `(1, 1)`.

**Exemplo**

```ts
const standard = EasingUtils.cubicBezier(0.2, 0, 0, 1)
standard(0.5) // ≈ 0.9
```
