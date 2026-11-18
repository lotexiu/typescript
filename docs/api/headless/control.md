# `headless/control`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Control`](#control) | classe | Base of every headless control: a value plus the rules to change it, with no DOM, CSS or framework. |
| [`TControlReducer`](#tcontrolreducer) | tipo | Last word on every write: receives the normalized next value and the current one, returns what is actually stored. Return `current` to refuse a change. |
| [`TControlOptions`](#tcontroloptions) | tipo | Options every headless control accepts. |

---

## `Control`

classe · [src/headless/control/model.ts:15](../../../src/headless/control/model.ts#L15)

Base of every headless control: a value plus the rules to change it, with no DOM, CSS or framework.

Two ways to change the value: `set()` is a programmatic write and always goes through (normalized and reduced);
the user intents (`toggle`, `increment`, `choose`, `keydown`, pointer handlers...) respect `disabled` and `readOnly`.
Handlers are arrow properties, so they can be passed around unbound (`onKeyDown={control.keydown}`).

```ts
class Control<V>
```

### Construtor

#### `constructor(prefix: string, options: TControlOptions<V>, fallback: V)`

### Propriedades

#### `readonly id: string`

Base id of the control's parts.

#### `readonly value: TWritable<V>`

The state. Read it reactively (`control.value()`); it is the external writable when one was passed.

#### `readonly initial: V`

Value when the control was created; `reset()` goes back to it and `dirty` compares against it.

#### `readonly disabled: TReactive<boolean>`

Whether the control is disabled.

#### `readonly readOnly: TReactive<boolean>`

Whether the control is read-only.

#### `readonly interactive: Computed<boolean>`

Neither disabled nor read-only: user intents are accepted.

#### `readonly dirty: Computed<boolean>`

The value differs from `initial`.

### Métodos

#### `keydown(event: TKeyIntent): boolean`

Keyboard handler. Ignores events already handled by an inner control; calls `preventDefault` and returns `true` when it handled the key.

#### `set(next: V): boolean`

Writes a value programmatically (normalized, then passed to the reducer). Returns whether it changed.

#### `reset(): void`

Goes back to `initial`.

#### `dispose(): void`

Releases subscriptions the control holds (layer tracking, value syncing). Call when the control is thrown away.

---

## `TControlReducer`

tipo · [src/headless/control/types.ts:6](../../../src/headless/control/types.ts#L6)

Last word on every write: receives the normalized next value and the current one, returns what is actually stored. Return `current` to refuse a change.

```ts
type TControlReducer<V> = (next: V, current: V) => V
```

---

## `TControlOptions`

tipo · [src/headless/control/types.ts:9](../../../src/headless/control/types.ts#L9)

Options every headless control accepts.

```ts
type TControlOptions<V> = { … }
```

### Propriedades

#### `readonly id?: string`

Base id for the parts (`<id>`, `<id>-thumb`, `<id>-listbox`...). Generated when left out.

#### `readonly value?: V | TWritable<V>`

Initial value, or a writable (`signal`, `field`, `writable`) to keep the state outside the control.

#### `readonly disabled?: TMaybeReactive<boolean>`

Ignores user intents and takes the control out of the tab order. Static or reactive.

#### `readonly readOnly?: TMaybeReactive<boolean>`

Ignores user intents but keeps the control focusable. Static or reactive.

#### `readonly reducer?: TControlReducer<V>`

See `TControlReducer`.
