# `motion/frame`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TFrameScheduler`](#tframescheduler) | tipo | Schedules `callback` for the next frame with the current time in milliseconds; returns the function that cancels it. |
| [`FrameUtils`](#frameutils) | classe | The default frame scheduler of the animations — `requestAnimationFrame` when the platform has it, a timer otherwise. |

---

## `TFrameScheduler`

tipo · [src/motion/frame/types.ts:2](../../../src/motion/frame/types.ts#L2)

Schedules `callback` for the next frame with the current time in milliseconds; returns the function that cancels it.

```ts
type TFrameScheduler = (callback: (now: number) => void) => () => void
```

---

## `FrameUtils`

classe · [src/motion/frame/utils.ts:5](../../../src/motion/frame/utils.ts#L5)

The default frame scheduler of the animations — `requestAnimationFrame` when the platform has it, a timer otherwise.

```ts
class FrameUtils
```

### Estáticos

#### `static readonly schedule: TFrameScheduler`

Schedules `callback` for the next frame. Returns the function that cancels it.

#### `static now(): number`

Current time in milliseconds, from `performance.now()` when available.
