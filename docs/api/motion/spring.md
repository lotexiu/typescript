# `motion/spring`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Spring`](#spring) | classe | A number that follows its target like a spring — natural motion that keeps its speed when the target changes mid-way. Read `value()` (reactive) and render it; nothing here touches the DOM. |
| [`TSpringConfig`](#tspringconfig) | tipo | Physics of a spring. Stiffer moves faster; more damping bounces less. |
| [`TSpringState`](#tspringstate) | tipo | Position and speed of a spring at an instant. |
| [`TSpringOptions`](#tspringoptions) | tipo | Options of a `Spring`. |
| [`SpringUtils`](#springutils) | classe | Pure spring physics: advance a state towards a target, and tell when it has settled. |

---

## `Spring`

classe · [src/motion/spring/model.ts:16](../../../src/motion/spring/model.ts#L16)

A number that follows its target like a spring — natural motion that keeps its speed when the target changes mid-way.
Read `value()` (reactive) and render it; nothing here touches the DOM.

```ts
class Spring
```

**Exemplo**

```ts
const scale = new Spring(0.9)
scale.set(1) // animates to 1, frame by frame
```

### Construtor

#### `constructor(initial = 0, options: TSpringOptions = {})`

### Propriedades

#### `readonly value: Computed<number>`

Current value.

#### `readonly target: Computed<number>`

Where the spring is heading.

#### `readonly moving: Computed<boolean>`

Whether it is still moving.

#### `readonly config: TSpringConfig`

Stiffness, damping, mass and precision in use.

### Métodos

#### `set(target: number): void`

Moves towards a new target (keeping the current speed).

#### `jump(value: number): void`

Jumps to a value with no animation (stops the motion).

#### `stop(): void`

Stops where it is.

#### `dispose(): void`

Stops the animation for good.

---

## `TSpringConfig`

tipo · [src/motion/spring/types.ts:4](../../../src/motion/spring/types.ts#L4)

Physics of a spring. Stiffer moves faster; more damping bounces less.

```ts
type TSpringConfig = { … }
```

### Propriedades

#### `readonly stiffness?: number`

Pull towards the target. Default 170.

#### `readonly damping?: number`

Friction. Default 26.

#### `readonly mass?: number`

Inertia. Default 1.

#### `readonly precision?: number`

Distance and speed below which the spring snaps to the target and stops. Default 0.001.

---

## `TSpringState`

tipo · [src/motion/spring/types.ts:16](../../../src/motion/spring/types.ts#L16)

Position and speed of a spring at an instant.

```ts
type TSpringState = { … }
```

### Propriedades

#### `readonly value: number`

Position.

#### `readonly velocity: number`

Speed, in units per second.

---

## `TSpringOptions`

tipo · [src/motion/spring/types.ts:24](../../../src/motion/spring/types.ts#L24)

Options of a `Spring`.

```ts
type TSpringOptions = TSpringConfig & {
	/** Frame scheduler; inject one in tests. Default `FrameUtils.schedule`. */
	readonly scheduler?: TFrameScheduler;
}
```

---

## `SpringUtils`

classe · [src/motion/spring/utils.ts:5](../../../src/motion/spring/utils.ts#L5)

Pure spring physics: advance a state towards a target, and tell when it has settled.

```ts
class SpringUtils
```

### Estáticos

#### `static advance(state: TSpringState, target: number, config: TSpringConfig, seconds: number): TSpringState`

The state after `seconds`, integrated in small steps (semi-implicit Euler).

#### `static isSettled(state: TSpringState, target: number, precision: number = SPRING_DEFAULTS.PRECISION): boolean`

Close enough to the target and slow enough to stop.
