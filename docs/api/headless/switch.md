# `headless/switch`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Switch`](#switch) | classe | An on/off switch. Space and Enter toggle. |

---

## `Switch`

classe · [src/headless/switch/model.ts:14](../../../src/headless/switch/model.ts#L14)

An on/off switch. Space and Enter toggle.

Anatomy: `parts.root()` on the track (`role="switch"`), `parts.thumb()` on the moving knob.

```ts
class Switch extends Control<boolean>
```

Estende [`Control`](control.md#control) — os membros herdados estão documentados lá.

### Construtor

#### `constructor(options: TControlOptions<boolean> = {})`

### Propriedades

#### `readonly state: Computed<'on' | 'off'>`

`on` or `off`.

### Métodos

#### `toggle(): boolean`

Flips the switch.

#### `turnOn(): boolean`

Turns the switch on.

#### `turnOff(): boolean`

Turns the switch off.

#### `parts.root(): TAttributes`

#### `parts.thumb(): TAttributes`
