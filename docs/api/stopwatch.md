# `stopwatch`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`STOP_WATCH_LOCALES`](#stop_watch_locales) | constante | Messages of the errors thrown by `StopWatch`. |
| [`StopWatch`](#stopwatch) | classe | Measures laps with `performance.now()`, with pause/resume, totals, average and an estimate of the time left. |

---

## `STOP_WATCH_LOCALES`

constante · [src/stopwatch/locale.ts:4](../../src/stopwatch/locale.ts#L4)

Messages of the errors thrown by `StopWatch`.

```ts
const STOP_WATCH_LOCALES
```

### Estáticos

#### `'en-US': { notStarted: 'StopWatch has not been started', }`

#### `'pt-BR': { notStarted: 'O StopWatch não foi iniciado', }`

---

## `StopWatch`

classe · [src/stopwatch/model.ts:10](../../src/stopwatch/model.ts#L10)

Measures laps with `performance.now()`, with pause/resume, totals, average and an estimate of the time left.

```ts
class StopWatch
```

### Propriedades

#### `readonly paused = signal(false)`

Whether it is paused.

#### `readonly laps = signal<number[]>([]`

Recorded laps, in milliseconds.

#### `readonly totalLaps = signal(NaN)`

Expected number of laps, for `estimated` (NaN when unknown).

#### `readonly duration`

Sum of the laps.

#### `readonly average = computed(() => this.duration() / this.laps().length)`

Mean lap.

#### `readonly avarage = this.average`

Old spelling of `average`.

> **Obsoleto.** Misspelled — use `average`.

#### `readonly estimated`

Time left for the remaining laps at the average pace.

#### `readonly currentLap`

Last recorded lap.

### Métodos

#### `start()`

Clears the laps and starts timing.

#### `pause()`

Congela a volta atual (não zera nada). Sem efeito se não foi iniciado ou já está pausado.

#### `resume()`

Continua de onde parou: o tempo parado não conta.

#### `lap()`

Records the running lap and starts the next one. Throws when not started.

#### `measure<T>(fn: () => T): T`

Times one call of `fn` and records it as a lap — independent of `start()`/`lap()`, so separate
operations can be timed one by one (`average` then is the mean cost per call).

#### `current()`

Milliseconds of the running lap.
