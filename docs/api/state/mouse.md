# `state/mouse`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`MouseState`](#mousestate) | classe | Pointer position and pressed buttons as reactive state, fed by an adapter. |

---

## `MouseState`

classe · [src/state/mouse/model.ts:5](../../../src/state/mouse/model.ts#L5)

Pointer position and pressed buttons as reactive state, fed by an adapter.

```ts
class MouseState<Buttons extends PropertyKey>
```

Estende `PropertyKey`.

### Propriedades

#### `readonly position = signal({ x: -1, y: -1 })`

Last position (`-1, -1` before any move).

#### `readonly buttons = signal(new Set<Buttons>())`

Buttons currently pressed.

#### `readonly combo = computed(() => Array.from(this.buttons()).sort())`

Pressed buttons, sorted.

#### `readonly anyPressed = computed(() => this.buttons().size > 0)`

Whether any button is down.

### Métodos

#### `move(x: number, y: number): void`

Records the pointer position.

#### `press(button: Buttons): void`

Marks a button as pressed.

#### `release(button: Buttons): void`

Marks a button as released.

#### `isPressed(button: Buttons): boolean`

Whether a button is pressed.

#### `reset(): void`

Releases every button.
