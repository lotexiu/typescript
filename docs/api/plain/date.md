# `plain/date`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`PlainDate`](#plaindate) | classe | Data de calendário **sem horário nem fuso**, imutável, no vocabulário do `Temporal.PlainDate`. Validação de verdade (bissexto, dia por mês): uma data inválida **não existe** — `tryFrom` devolve `undefined`, `from` lança `RangeError` com a causa. Anos de 1 a 9999. |

---

## `PlainDate`

classe · [src/plain/date/model.ts:12](../../../src/plain/date/model.ts#L12)

Data de calendário **sem horário nem fuso**, imutável, no vocabulário do `Temporal.PlainDate`.
Validação de verdade (bissexto, dia por mês): uma data inválida **não existe** — `tryFrom` devolve `undefined`,
`from` lança `RangeError` com a causa. Anos de 1 a 9999.

```ts
class PlainDate
```

### Estáticos

#### `static isValid(year: number, month: number, day: number): boolean`

Whether the date exists in the calendar (years 1–9999).

#### `static tryFrom({ year, month, day }: TDateParts): PlainDate | undefined`

The date, or `undefined` when it does not exist.

#### `static from(parts: TDateParts | string): PlainDate`

The date from parts or ISO text; throws `RangeError` when it does not exist.

#### `static tryParse(text: string): PlainDate | undefined`

`YYYY-MM-DD`.

#### `static parse(text: string): PlainDate`

Reads `YYYY-MM-DD`; throws `RangeError` for bad text or dates.

#### `static fromDate(date: Date): PlainDate`

Campos **locais** de um `Date` (mesmo que o usuário vê no relógio dele).

#### `static today(now: () => Date = () => new Date()): PlainDate`

O relógio é injetável (testes, outros fusos): `PlainDate.today(() => new Date(...))`.

#### `static fromEpochDays(days: number): PlainDate`

Dias desde 1970-01-01 (negativos antes). Algoritmo "civil from days" de H. Hinnant.

#### `static compare(left: PlainDate, right: PlainDate): -1 | 0 | 1`

-1, 0 or 1, like a sort comparator.

### Propriedades

#### `get inLeapYear(): boolean`

Whether the year is leap.

#### `get daysInMonth(): number`

Days of the date's month.

#### `get daysInYear(): number`

365 or 366.

#### `get dayOfYear(): number`

Day of the year, from 1.

#### `get dayOfWeek(): TIsoWeekday`

1 = segunda ... 7 = domingo.

### Métodos

#### `toEpochDays(): number`

Days since 1970-01-01 (negative before it).

#### `add({ years = 0, months = 0, weeks = 0, days = 0 }: TDateAdd): PlainDate`

Anos/meses primeiro (o dia é "preso" ao último dia do mês), depois semanas/dias.

#### `subtract(amount: TDateAdd): PlainDate`

The date moved back by the given amount (months clamp to the last valid day).

#### `daysUntil(other: PlainDate): number`

Quantos dias até `other` (negativo se `other` for anterior).

#### `with(parts: Partial<TDateParts>): PlainDate`

A copy with some parts replaced; throws when the result does not exist.

#### `equals(other: PlainDate): boolean`

Same date.

#### `toString(): string`

ISO text, `YYYY-MM-DD`.

#### `toJSON(): string`

Same as `toString`.
