# `composables/ticker`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`ticker`](#ticker) | função | A timer as state: `count` goes up by one every `interval` ms while running — clocks, progress bars, polling. |
| [`TTickerOptions`](#ttickeroptions) | tipo | Options of `ticker`. |
| [`TTicker`](#tticker) | tipo | What `ticker` returns. |

---

## `ticker`

função · [src/composables/ticker/model.ts:6](../../../src/composables/ticker/model.ts#L6)

A timer as state: `count` goes up by one every `interval` ms while running — clocks, progress bars, polling.

```ts
function ticker(interval: number, options: TTickerOptions = {}): TTicker
```

---

## `TTickerOptions`

tipo · [src/composables/ticker/types.ts:4](../../../src/composables/ticker/types.ts#L4)

Options of `ticker`.

```ts
type TTickerOptions = { … }
```

### Propriedades

#### `autoStart?: boolean`

Starts right away. Default `false`.

---

## `TTicker`

tipo · [src/composables/ticker/types.ts:10](../../../src/composables/ticker/types.ts#L10)

What `ticker` returns.

```ts
type TTicker = { … }
```

### Propriedades

#### `count: Computed<number>`

How many ticks happened since the last `reset()`. Reading it inside a `computed` makes that `computed` re-run every tick.

#### `running: Computed<boolean>`

Whether it is ticking.

### Métodos

#### `start(): void`

Starts ticking (no effect when running).

#### `stop(): void`

Stops ticking, keeping the count.

#### `reset(): void`

Zeroes `count` (keeps running if it was).

#### `dispose(): void`

Stops and drops listeners.
