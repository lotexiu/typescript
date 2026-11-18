# `motion/tween`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Tween`](#tween) | classe | A number that moves to a target in a fixed time along an easing curve — predictable timing, unlike `Spring`. |
| [`TTweenOptions`](#ttweenoptions) | tipo | Options of a `Tween`. |

---

## `Tween`

classe · [src/motion/tween/model.ts:16](../../../src/motion/tween/model.ts#L16)

A number that moves to a target in a fixed time along an easing curve — predictable timing, unlike `Spring`.

```ts
class Tween
```

**Exemplo**

```ts
const opacity = new Tween(0, { duration: 150 })
opacity.to(1)
```

### Construtor

#### `constructor(initial = 0, options: TTweenOptions = {})`

### Propriedades

#### `readonly value: Computed<number>`

Current value.

#### `readonly running: Computed<boolean>`

Whether a transition is running.

#### `readonly duration: number`

Default length of a transition, in milliseconds.

#### `readonly easing: TEasing`

Curve applied to the progress.

### Métodos

#### `to(target: number, duration: number = this.duration): void`

Moves from the current value to `target` in `duration` milliseconds (default: the tween's).

#### `jump(value: number): void`

Jumps to a value with no animation.

#### `stop(): void`

Stops where it is.

#### `dispose(): void`

Stops the animation for good.

---

## `TTweenOptions`

tipo · [src/motion/tween/types.ts:5](../../../src/motion/tween/types.ts#L5)

Options of a `Tween`.

```ts
type TTweenOptions = { … }
```

### Propriedades

#### `readonly duration?: number`

Length of each transition in milliseconds. Default 200.

#### `readonly easing?: TEasing`

Default `EasingUtils.easeOut`.

#### `readonly scheduler?: TFrameScheduler`

Frame scheduler; inject one in tests. Default `FrameUtils.schedule`.
