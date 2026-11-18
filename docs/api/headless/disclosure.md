# `headless/disclosure`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Disclosure`](#disclosure) | classe | Shows and hides a piece of content (accordion section, "more details"). `value` is whether it is open. |

---

## `Disclosure`

classe · [src/headless/disclosure/model.ts:14](../../../src/headless/disclosure/model.ts#L14)

Shows and hides a piece of content (accordion section, "more details"). `value` is whether it is open.

Anatomy: `parts.trigger()` on the button, `parts.content()` on the content.

```ts
class Disclosure extends Control<boolean>
```

Estende [`Control`](control.md#control) — os membros herdados estão documentados lá.

### Construtor

#### `constructor(options: TControlOptions<boolean> = {})`

### Propriedades

#### `readonly contentId: string`

Id of the content element.

#### `readonly state: Computed<'open' | 'closed'>`

`open` or `closed`.

### Métodos

#### `show(): boolean`

Opens.

#### `hide(): boolean`

Closes.

#### `toggle(): boolean`

Opens when closed, closes when open.

#### `parts.trigger(): TAttributes`

#### `parts.content(): TAttributes`
