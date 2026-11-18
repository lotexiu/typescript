# `geometry/path`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`PathBuilder`](#pathbuilder) | classe | Builds path data in the SVG `d` syntax — plain text that an `<svg><path>` draws and that `new Path2D(text)` turns into a canvas path. Commands chain; `toString()` gives the text. |
| [`TPoint`](#tpoint) | tipo | A point in 2D. |

---

## `PathBuilder`

classe · [src/geometry/path/model.ts:10](../../../src/geometry/path/model.ts#L10)

Builds path data in the SVG `d` syntax — plain text that an `<svg><path>` draws and that `new Path2D(text)` turns into a
canvas path. Commands chain; `toString()` gives the text.

```ts
class PathBuilder
```

**Exemplo**

```ts
const arrow = new PathBuilder().moveTo(0, 0).lineTo(10, 5).lineTo(0, 10).close().toString() // "M0 0L10 5L0 10Z"
```

### Estáticos

#### `static polar(center: TPoint, radius: number, degrees: number): TPoint`

The point at `degrees` (0 = up, clockwise) and `radius` from a center.

#### `static polygon(points: readonly TPoint[], closed = true): string`

A closed (or open) polyline through the points.

#### `static roundedRect(x: number, y: number, width: number, height: number, radius: number): string`

A rectangle with rounded corners (the radius is limited to half the shorter side).

#### `static arc(center: TPoint, radius: number, startDegrees: number, endDegrees: number): string`

An arc of a circle from `startDegrees` to `endDegrees` (0 = up, clockwise) — gauges and progress rings.

#### `static slice(center: TPoint, radius: number, startDegrees: number, endDegrees: number): string`

A pie slice from the center — pie charts.

#### `static star(center: TPoint, points: number, radius: number, innerRadius: number): string`

A regular star or polygon (`innerRadius` equal to `radius` gives a polygon).

#### `static number(value: number): string`

A number as path text, rounded and without trailing zeros.

### Métodos

#### `moveTo(x: number, y: number): this`

Starts a new sub-path at a point.

#### `lineTo(x: number, y: number): this`

Straight line to a point.

#### `quadraticTo(controlX: number, controlY: number, x: number, y: number): this`

Quadratic curve with one control point.

#### `cubicTo(firstX: number, firstY: number, secondX: number, secondY: number, x: number, y: number): this`

Cubic curve with two control points.

#### `arcTo(radiusX: number, radiusY: number, rotation: number, largeArc: boolean, sweep: boolean, x: number, y: number): this`

Elliptical arc to a point, as in SVG (`largeArc` and `sweep` pick which of the four possible arcs).

#### `close(): this`

Closes the sub-path with a line to its start.

#### `toString(): string`

The path data.

---

## `TPoint`

tipo · [src/geometry/path/types.ts:2](../../../src/geometry/path/types.ts#L2)

A point in 2D.

```ts
type TPoint = { … }
```

### Propriedades

#### `readonly x: number`

Horizontal coordinate.

#### `readonly y: number`

Vertical coordinate (grows downwards, as on screens).
