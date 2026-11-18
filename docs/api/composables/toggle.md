# `composables/toggle`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Toggle`](#toggle) | tipo | A boolean signal with `on`, `off` and `toggle`. |
| [`Toggle`](#toggle) | constante | Methods shared by every instance (assigned to each one) and the `instanceof` check. |
| [`toggle`](#toggle) | função | Creates a `Toggle`. |

---

## `Toggle`

tipo · [src/composables/toggle/model.ts:5](../../../src/composables/toggle/model.ts#L5)

A boolean signal with `on`, `off` and `toggle`.

```ts
type Toggle = Signal<boolean> & { on(): void; off(): void; toggle(): void; }
```

---

## `Toggle`

constante · [src/composables/toggle/model.ts:11](../../../src/composables/toggle/model.ts#L11)

Methods shared by every instance (assigned to each one) and the `instanceof` check.

```ts
const Toggle
```

---

## `toggle`

função · [src/composables/toggle/model.ts:32](../../../src/composables/toggle/model.ts#L32)

Creates a `Toggle`.

```ts
function toggle(initial = false, equal?: TEqual<boolean>): Toggle
```
