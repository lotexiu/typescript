# `plain`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TDurationUnit`](#tdurationunit) | tipo | Unidades fixas de tempo (sem meses/anos: eles dependem do calendário e ficam em `PlainDate`). |
| [`TDurationParts`](#tdurationparts) | tipo | Amounts per unit, for building or adding durations. |
| [`TDateParts`](#tdateparts) | tipo | A calendar date: year, month (1–12) and day. |
| [`TDateAdd`](#tdateadd) | tipo | Soma de calendário: meses/anos "prendem" o dia ao último dia do mês (31/jan + 1 mês = 28 ou 29/fev). |
| [`TTimeParts`](#ttimeparts) | tipo | A time of day; missing parts are 0. |
| [`TIsoWeekday`](#tisoweekday) | tipo | 1 = segunda ... 7 = domingo (ISO 8601, como o Temporal). |
| [`PlainUtils`](#plainutils) | classe | Auxiliares puros compartilhados por `PlainDate`, `PlainTime` e `Duration`. |

---

## `TDurationUnit`

tipo · [src/plain/types.ts:2](../../src/plain/types.ts#L2)

Unidades fixas de tempo (sem meses/anos: eles dependem do calendário e ficam em `PlainDate`).

```ts
type TDurationUnit = 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'
```

---

## `TDurationParts`

tipo · [src/plain/types.ts:5](../../src/plain/types.ts#L5)

Amounts per unit, for building or adding durations.

```ts
type TDurationParts = Partial<Record<TDurationUnit, number>>
```

---

## `TDateParts`

tipo · [src/plain/types.ts:8](../../src/plain/types.ts#L8)

A calendar date: year, month (1–12) and day.

```ts
type TDateParts = Readonly<{ year: number; month: number; day: number }>
```

---

## `TDateAdd`

tipo · [src/plain/types.ts:11](../../src/plain/types.ts#L11)

Soma de calendário: meses/anos "prendem" o dia ao último dia do mês (31/jan + 1 mês = 28 ou 29/fev).

```ts
type TDateAdd = Partial<Record<'years' | 'months' | 'weeks' | 'days', number>>
```

---

## `TTimeParts`

tipo · [src/plain/types.ts:14](../../src/plain/types.ts#L14)

A time of day; missing parts are 0.

```ts
type TTimeParts = Readonly<{ hour: number; minute?: number; second?: number; millisecond?: number }>
```

---

## `TIsoWeekday`

tipo · [src/plain/types.ts:17](../../src/plain/types.ts#L17)

1 = segunda ... 7 = domingo (ISO 8601, como o Temporal).

```ts
type TIsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7
```

---

## `PlainUtils`

classe · [src/plain/utils.ts:4](../../src/plain/utils.ts#L4)

Auxiliares puros compartilhados por `PlainDate`, `PlainTime` e `Duration`.

```ts
class PlainUtils
```

### Estáticos

#### `static isLeap(year: number): boolean`

Whether the year has 29 February (Gregorian rules).

#### `static daysInMonth(year: number, month: number): number`

Dias do mês (`month` 1–12) no ano dado.

#### `static isInt(value: unknown): value is number`

Whether the value is an integer number.

#### `static inRange(value: number, max: number): boolean`

Inteiro em `[0, max]`.

#### `static pad(value: number, size = 2): string`

The number as text with leading zeros up to `size`.
