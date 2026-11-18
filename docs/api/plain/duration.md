# `plain/duration`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Duration`](#duration) | classe | Duração imutável, em milissegundos inteiros, no vocabulário do Temporal (`Temporal.Duration`). Só unidades fixas (dias, horas, minutos, segundos, ms): "1 mês" não é uma duração fixa — use `PlainDate.add`. Os componentes (`hours`, `minutes`...) são do **valor absoluto**; o sinal vem em `sign`. |

---

## `Duration`

classe · [src/plain/duration/model.ts:10](../../../src/plain/duration/model.ts#L10)

Duração imutável, em milissegundos inteiros, no vocabulário do Temporal (`Temporal.Duration`).
Só unidades fixas (dias, horas, minutos, segundos, ms): "1 mês" não é uma duração fixa — use `PlainDate.add`.
Os componentes (`hours`, `minutes`...) são do **valor absoluto**; o sinal vem em `sign`.

```ts
class Duration
```

### Estáticos

#### `static readonly zero = new Duration(0)`

A duration of zero.

#### `static fromMilliseconds(ms: number): Duration`

A duration of `ms` milliseconds.

#### `static from(source: TDurationParts | string | Duration): Duration`

`Duration.from({ hours: 1, minutes: 30 })` ou `Duration.from('PT1H30M')`.

#### `static tryParse(text: string): Duration | undefined`

Reads ISO 8601 text (`PT1H30M`), or `undefined`.

#### `static parse(text: string): Duration`

Reads ISO 8601 text; throws `RangeError` for anything else.

#### `static compare(left: Duration, right: Duration): -1 | 0 | 1`

-1, 0 ou 1.

### Propriedades

#### `get sign(): -1 | 0 | 1`

-1, 0 or 1.

#### `get blank(): boolean`

Whether it is zero.

#### `get days(): number`

Whole days.

#### `get hours(): number`

Hours left after the days (0–23).

#### `get minutes(): number`

Minutes left after the hours (0–59).

#### `get seconds(): number`

Seconds left after the minutes (0–59).

#### `get milliseconds(): number`

Milliseconds left after the seconds (0–999).

### Métodos

#### `total(unit: TDurationUnit): number`

Total em uma unidade (pode ser fracionário): `Duration.from({ minutes: 90 }).total('hours') === 1.5`.

#### `toMilliseconds(): number`

Total length in milliseconds.

#### `add(other: TDurationParts | string | Duration): Duration`

Sum with another duration.

#### `subtract(other: TDurationParts | string | Duration): Duration`

Difference with another duration.

#### `negated(): Duration`

Opposite sign.

#### `abs(): Duration`

Without sign.

#### `equals(other: Duration): boolean`

Same length.

#### `toString(): string`

ISO 8601 text (`PT1H30M`).

#### `toJSON(): string`

Same as `toString`.
