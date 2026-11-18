# `headless/layer`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`LayerStack`](#layerstack) | classe | Order in which overlays (dialogs, menus, popovers, open selects) were opened. Only the topmost one reacts to Escape or to a click outside, so closing a menu inside a dialog never closes the dialog too. Controls register themselves in `LayerStack.shared` unless given another stack. |

---

## `LayerStack`

classe · [src/headless/layer/model.ts:11](../../../src/headless/layer/model.ts#L11)

Order in which overlays (dialogs, menus, popovers, open selects) were opened. Only the topmost one reacts to
Escape or to a click outside, so closing a menu inside a dialog never closes the dialog too.
Controls register themselves in `LayerStack.shared` unless given another stack.

```ts
class LayerStack
```

### Estáticos

#### `static readonly shared = new LayerStack()`

The stack every overlay uses by default.

### Propriedades

#### `readonly layers: Computed<readonly string[]>`

Ids of the open layers, oldest first.

#### `readonly top: Computed<string | undefined>`

Id of the most recently opened layer, if any.

### Métodos

#### `push(id: string): void`

Puts `id` on top (moving it if already there).

#### `remove(id: string): void`

Takes `id` out of the stack.

#### `isTop(id: string): boolean`

Whether `id` is the topmost layer. Reactive.

#### `track(id: string, open: TReactive<boolean>): TValueUnsubscribe`

Keeps `id` in the stack while `open` is true. Returns the function that stops tracking (and removes it).
