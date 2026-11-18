# `calendar`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TCalendarCell`](#tcalendarcell) | tipo | A day of a month grid; `inMonth` is false for the days that fill the first and last weeks. |
| [`TMonthGridOptions`](#tmonthgridoptions) | tipo | Options of `CalendarUtils.month`. |
| [`CalendarUtils`](#calendarutils) | classe | Lógica pura de calendário (sem DOM): a base de qualquer date-picker. Substitui o antigo `Time.calendarDays`. |

---

## `TCalendarCell`

tipo · [src/calendar/types.ts:5](../../src/calendar/types.ts#L5)

A day of a month grid; `inMonth` is false for the days that fill the first and last weeks.

```ts
type TCalendarCell = Readonly<{ date: PlainDate; inMonth: boolean }>
```

---

## `TMonthGridOptions`

tipo · [src/calendar/types.ts:8](../../src/calendar/types.ts#L8)

Options of `CalendarUtils.month`.

```ts
type TMonthGridOptions = Readonly<{
	/** Primeiro dia da semana na grade: 1 = segunda (padrão, ISO) ... 7 = domingo. */
	weekStart?: TIsoWeekday;
	/** `6` (padrão): sempre 42 células, a grade não "pula" de altura entre meses. `'auto'`: só as semanas necessárias. */
	weeks?: number | 'auto';
}>
```

---

## `CalendarUtils`

classe · [src/calendar/utils.ts:8](../../src/calendar/utils.ts#L8)

Lógica pura de calendário (sem DOM): a base de qualquer date-picker. Substitui o antigo `Time.calendarDays`.

```ts
class CalendarUtils
```

### Estáticos

#### `static month(year: number, month: number, { weekStart = 1, weeks = FIXED_WEEKS }: TMonthGridOptions = {}): TCalendarCell[]`

Células de um mês (com os dias dos meses vizinhos que completam as semanas), em ordem de leitura. `month` é 1–12.

#### `static weekdays(weekStart: TIsoWeekday = 1): TIsoWeekday[]`

Os dias da semana (ISO) na ordem em que o cabeçalho da grade os mostra.

#### `static inRange(date: PlainDate, min?: PlainDate, max?: PlainDate): boolean`

Dentro de `[min, max]` (limites opcionais, inclusivos)?
