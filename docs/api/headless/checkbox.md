# `headless/checkbox`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Checkbox`](#checkbox) | classe | A tri-state checkbox (checked, unchecked, mixed). Space toggles; from mixed it goes to checked. |
| [`TCheckedState`](#tcheckedstate) | tipo | `true`, `false`, or `'mixed'` for an indeterminate box (some children checked). |
| [`TCheckboxState`](#tcheckboxstate) | tipo | The checked state as a `data-state` word. |
| [`TCheckboxOptions`](#tcheckboxoptions) | tipo | Options of a `Checkbox`. |

---

## `Checkbox`

classe · [src/headless/checkbox/model.ts:18](../../../src/headless/checkbox/model.ts#L18)

A tri-state checkbox (checked, unchecked, mixed). Space toggles; from mixed it goes to checked.

Anatomy: `parts.root()` on the clickable box (`role="checkbox"`).

```ts
class Checkbox extends Control<TCheckedState>
```

Estende [`Control`](control.md#control) — os membros herdados estão documentados lá.

**Exemplo**

```ts
const terms = new Checkbox()
<div {...terms.parts.root()} onClick={terms.toggle} onKeyDown={terms.keydown} />
```

### Construtor

#### `constructor(options: TCheckboxOptions = {})`

### Propriedades

#### `readonly checked: Computed<boolean>`

The value is exactly `true`.

#### `readonly indeterminate: Computed<boolean>`

The value is `'mixed'`.

#### `readonly state: Computed<TCheckboxState>`

`checked`, `unchecked` or `indeterminate`.

#### `readonly required: TReactive<boolean>`

Whether the box is required.

### Métodos

#### `toggle(): boolean`

Checks when unchecked or mixed, unchecks when checked.

#### `check(): boolean`

Checks the box.

#### `uncheck(): boolean`

Unchecks the box.

#### `parts.root(): TAttributes`

---

## `TCheckedState`

tipo · [src/headless/checkbox/types.ts:5](../../../src/headless/checkbox/types.ts#L5)

`true`, `false`, or `'mixed'` for an indeterminate box (some children checked).

```ts
type TCheckedState = boolean | 'mixed'
```

---

## `TCheckboxState`

tipo · [src/headless/checkbox/types.ts:8](../../../src/headless/checkbox/types.ts#L8)

The checked state as a `data-state` word.

```ts
type TCheckboxState = 'checked' | 'unchecked' | 'indeterminate'
```

---

## `TCheckboxOptions`

tipo · [src/headless/checkbox/types.ts:11](../../../src/headless/checkbox/types.ts#L11)

Options of a `Checkbox`.

```ts
type TCheckboxOptions = TControlOptions<TCheckedState> & {
	/** Marks the box as required (`aria-required`). */
	readonly required?: TMaybeReactive<boolean>;
}
```
