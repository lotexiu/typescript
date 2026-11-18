# `state/keyboard`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`KeyboardState`](#keyboardstate) | classe | Pressed keys as reactive state, fed by an adapter (`press`/`release`) — no DOM listener here. |

---

## `KeyboardState`

classe · [src/state/keyboard/model.ts:5](../../../src/state/keyboard/model.ts#L5)

Pressed keys as reactive state, fed by an adapter (`press`/`release`) — no DOM listener here.

```ts
class KeyboardState<KeyCode>
```

### Propriedades

#### `readonly keys = signal(new Set<KeyCode>())`

Keys currently pressed.

#### `readonly combo = computed(() => Array.from(this.keys()).sort())`

Pressed keys, sorted — compare it to detect shortcuts.

#### `readonly anyPressed = computed(() => this.keys().size > 0)`

Whether any key is down.

### Métodos

#### `press(code: KeyCode): void`

Marks a key as pressed.

#### `release(code: KeyCode): void`

Marks a key as released.

#### `isPressed(code: KeyCode): boolean`

Whether a key is pressed.

#### `reset(): void`

Releases every key (e.g. when the window loses focus).
