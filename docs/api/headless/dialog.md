# `headless/dialog`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Dialog`](#dialog) | classe | A window over the page: open state, which overlay is on top, Escape and click-outside rules, and the ids that tie trigger, title, description and content together. Moving focus into it and trapping Tab are the adapter's job. |
| [`TDismissReason`](#tdismissreason) | tipo | Why an overlay is being closed by the user. |
| [`TDialogOptions`](#tdialogoptions) | tipo | Options of a `Dialog`. |

---

## `Dialog`

classe · [src/headless/dialog/model.ts:18](../../../src/headless/dialog/model.ts#L18)

A window over the page: open state, which overlay is on top, Escape and click-outside rules, and the ids that tie
trigger, title, description and content together. Moving focus into it and trapping Tab are the adapter's job.

```ts
class Dialog extends Control<boolean>
```

Estende [`Control`](control.md#control) — os membros herdados estão documentados lá.

**Exemplo**

```ts
const confirm = new Dialog({ role: 'alertdialog' })
confirm.show()
confirm.parts.content() // { role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': '<id>-title', ... }
```

### Construtor

#### `constructor(options: TDialogOptions = {})`

### Propriedades

#### `readonly modal: boolean`

Blocks the rest of the page.

#### `readonly role: 'dialog' | 'alertdialog'`

`dialog` or `alertdialog`.

#### `readonly closeOnEscape: boolean`

Escape closes it.

#### `readonly closeOnOutside: boolean`

A click outside closes it.

#### `readonly layers: LayerStack`

Stack used to decide which overlay is on top.

#### `readonly contentId: string`

Id of the content element.

#### `readonly titleId: string`

Id of the title element (`aria-labelledby`).

#### `readonly descriptionId: string`

Id of the description element (`aria-describedby`).

#### `readonly state: Computed<'open' | 'closed'>`

`open` or `closed`.

#### `readonly isTop: Computed<boolean>`

True while this is the most recently opened overlay.

#### `readonly lastDismiss: Signal<TDismissReason | undefined>`

Why it was last closed by the user (`undefined` after a programmatic `hide`).

### Métodos

#### `show(): boolean`

Opens.

#### `hide(): void`

Closes, regardless of `closeOnEscape`/`closeOnOutside`.

#### `toggle(): boolean`

Opens when closed, closes when open.

#### `dismiss(reason: TDismissReason): boolean`

Closes because of the user, following `closeOnEscape`/`closeOnOutside` and only when on top.

#### `interactOutside(): boolean`

Call on a pointer down outside the content (and outside the trigger).

#### `parts.trigger(): TAttributes`

#### `parts.backdrop(): TAttributes`

#### `parts.content(): TAttributes`

#### `parts.title(): TAttributes`

#### `parts.description(): TAttributes`

---

## `TDismissReason`

tipo · [src/headless/dialog/types.ts:5](../../../src/headless/dialog/types.ts#L5)

Why an overlay is being closed by the user.

```ts
type TDismissReason = 'escape' | 'outside' | 'close'
```

---

## `TDialogOptions`

tipo · [src/headless/dialog/types.ts:8](../../../src/headless/dialog/types.ts#L8)

Options of a `Dialog`.

```ts
type TDialogOptions = TControlOptions<boolean> & {
	/** Blocks the rest of the page (`aria-modal`). Default `true` for `Dialog`, `false` for `Popover`. */
	readonly modal?: boolean;
	/** `'alertdialog'` for confirmations that interrupt the user. Default `'dialog'`. */
	readonly role?: 'dialog' | 'alertdialog';
	/** Default `true`. */
	readonly closeOnEscape?: boolean;
	/** Default `true` for non-modal overlays, `false` for modal dialogs. */
	readonly closeOnOutside?: boolean;
	/** Stack used to decide which overlay is on top. Default `LayerStack.shared`. */
	readonly layers?: LayerStack;
}
```
