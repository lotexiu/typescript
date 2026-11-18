# `composables/ui-interaction`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`UIInteraction`](#uiinteraction) | tipo | Hover, focus and active flags of an element, kept in one `BitFlag`. |
| [`UIInteraction`](#uiinteraction) | constante | Methods shared by every instance (assigned to each one) and the `instanceof` check. |
| [`uiInteraction`](#uiinteraction) | função | Creates a `UIInteraction` with every flag off. |

---

## `UIInteraction`

tipo · [src/composables/ui-interaction/model.ts:4](../../../src/composables/ui-interaction/model.ts#L4)

Hover, focus and active flags of an element, kept in one `BitFlag`.

```ts
type UIInteraction = { … }
```

### Propriedades

#### `state: BitFlag<'focused' | 'hovered' | 'active'>`

The flags.

#### `hover: () => void`

Pointer entered.

#### `unhover: () => void`

Pointer left.

#### `blur: () => void`

Focus left (also ends active).

#### `focus: () => void`

Got focus.

#### `active: () => void`

Pressed (also focused).

#### `unactive: () => void`

Released.

---

## `UIInteraction`

constante · [src/composables/ui-interaction/model.ts:21](../../../src/composables/ui-interaction/model.ts#L21)

Methods shared by every instance (assigned to each one) and the `instanceof` check.

```ts
const UIInteraction
```

---

## `uiInteraction`

função · [src/composables/ui-interaction/model.ts:59](../../../src/composables/ui-interaction/model.ts#L59)

Creates a `UIInteraction` with every flag off.

```ts
function uiInteraction()
```
