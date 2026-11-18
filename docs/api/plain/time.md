# `plain/time`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`PlainTime`](#plaintime) | classe | Hora do dia **sem data nem fuso**, imutável (`Temporal.PlainTime`). Passar de 24h dá a volta (23:30 + 1h = 00:30). |

---

## `PlainTime`

classe · [src/plain/time/model.ts:9](../../../src/plain/time/model.ts#L9)

Hora do dia **sem data nem fuso**, imutável (`Temporal.PlainTime`). Passar de 24h dá a volta (23:30 + 1h = 00:30).

```ts
class PlainTime
```

### Estáticos

#### `static isValid(hour: number, minute = 0, second = 0, millisecond = 0): boolean`

Whether the parts form a valid time of day.

#### `static tryFrom({ hour, minute = 0, second = 0, millisecond = 0 }: TTimeParts): PlainTime | undefined`

The time, or `undefined` when invalid.

#### `static from(parts: TTimeParts | string): PlainTime`

The time from parts or ISO text; throws `RangeError` when invalid.

#### `static tryParse(text: string): PlainTime | undefined`

`HH:mm`, `HH:mm:ss` ou `HH:mm:ss.SSS`.

#### `static parse(text: string): PlainTime`

Reads `HH:mm`, `HH:mm:ss` or `HH:mm:ss.sss`; throws `RangeError` otherwise.

#### `static fromMilliseconds(ms: number): PlainTime`

Milissegundos desde 00:00; valores fora de um dia dão a volta.

#### `static compare(left: PlainTime, right: PlainTime): -1 | 0 | 1`

-1, 0 or 1, like a sort comparator.

### Métodos

#### `toMilliseconds(): number`

Milliseconds since midnight.

#### `add(amount: TDurationParts | string | Duration): PlainTime`

The time moved forward, wrapping around midnight.

#### `subtract(amount: TDurationParts | string | Duration): PlainTime`

The time moved back, wrapping around midnight.

#### `until(other: PlainTime): Duration`

Diferença **sem dar a volta**: `09:00.until(17:30)` = 8h30; se `other` for antes, é negativa.

#### `equals(other: PlainTime): boolean`

Same time.

#### `toString(): string`

ISO text (`HH:mm:ss`, with milliseconds when present).

#### `toJSON(): string`

Same as `toString`.
