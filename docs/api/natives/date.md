# `natives/date`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TDateSetValue`](#tdatesetvalue) | tipo | Date parts to set or add: `year`, `month` (0-based), `day`, `hour`, `minute`, `second`, `millisecond`. |
| [`TDateSetChecker`](#tdatesetchecker) | tipo | Which date parts to move to their start or end. |
| [`DateUtils`](#dateutils) | classe | Helpers that change a `Date` in place, part by part. For immutable dates without time zones, see `PlainDate`/`PlainTime`. |

---

## `TDateSetValue`

tipo · [src/natives/date/types.ts:5](../../../src/natives/date/types.ts#L5)

Date parts to set or add: `year`, `month` (0-based), `day`, `hour`, `minute`, `second`, `millisecond`.

```ts
type TDateSetValue = Partial<Record<TDateKeys, number>>
```

---

## `TDateSetChecker`

tipo · [src/natives/date/types.ts:8](../../../src/natives/date/types.ts#L8)

Which date parts to move to their start or end.

```ts
type TDateSetChecker = Partial<Record<Exclude<TDateKeys, 'year'>, boolean>>
```

---

## `DateUtils`

classe · [src/natives/date/utils.ts:7](../../../src/natives/date/utils.ts#L7)

Helpers that change a `Date` in place, part by part. For immutable dates without time zones, see `PlainDate`/`PlainTime`.

```ts
class DateUtils
```

### Estáticos

#### `static set(date: Date, value: TDateSetValue)`

Sets the given parts. Returns the same date.

#### `static increment(date: Date, value: TDateSetValue)`

Adds the given amounts to each part; overflow rolls over (31 Jan + 1 day = 1 Feb).

#### `static setEnd(date: Date, value: TDateSetChecker)`

Moves the flagged parts to their last value: December, last day of the month, 23:59:59.999.

#### `static setStart(date: Date, value: TDateSetChecker)`

Moves the flagged parts to their first value: January, day 1, 00:00:00.000.
