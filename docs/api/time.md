# `time`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Time`](#time) | classe | Legacy mutable date with each part as a writable `field`. New code should use `PlainDate`/`PlainTime`. |

---

## `Time`

classe · [src/time/model.ts:5](../../src/time/model.ts#L5)

Legacy mutable date with each part as a writable `field`. New code should use `PlainDate`/`PlainTime`.

```ts
class Time
```

### Construtor

#### `constructor(date?: Date)`

Starts at `date` (default: now).

### Propriedades

#### `readonly year`

Full year.

#### `readonly month`

Month, from 0.

#### `readonly day`

Day of the month.

#### `readonly hour`

Hour.

#### `readonly minutes`

Minutes.

#### `readonly seconds`

Seconds.

#### `readonly milliseconds`

Milliseconds.

#### `readonly week`

Week of the month, from 1 (`ceil(day / 7)`).

#### `readonly weekday`

Day of the week, from 0 (Sunday).

### Métodos

#### `refresh(date: Date = new Date()): void`

Moves this instance to `date` (default: right now), notifying every field.

#### `getTime(): number`

Milliseconds since the epoch.

#### `getTimezoneOffset(): number`

Same as `Date#getTimezoneOffset`.

#### `toString(): string`

Same as `Date#toString`.

#### `toISOString(): string`

Same as `Date#toISOString`.

#### `toLocaleString(...args: Parameters<Date['toLocaleString']>): string`

Same as `Date#toLocaleString`.

#### `toUTCString(): string`

Same as `Date#toUTCString`.

#### `toJSON(): string`

Same as `Date#toJSON`.
