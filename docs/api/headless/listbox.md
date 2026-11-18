# `headless/listbox`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Listbox`](#listbox) | classe | A list of options where one (`single`) or several (`multiple`) are selected; the highlight moves with arrows, Home/End and typing. |
| [`TSelectionMode`](#tselectionmode) | tipo | How many options a `Listbox` keeps selected. |
| [`TListboxOptions`](#tlistboxoptions) | tipo | Options of a `Listbox`. The value is the array of selected keys. |

---

## `Listbox`

classe · [src/headless/listbox/model.ts:18](../../../src/headless/listbox/model.ts#L18)

A list of options where one (`single`) or several (`multiple`) are selected; the highlight moves with arrows, Home/End and typing.

Anatomy: `parts.root()` on the list (`role="listbox"`, focusable, uses `aria-activedescendant`), `parts.option(key)` on each option.

```ts
class Listbox<T, K = TDefaultKey<T>> extends ListControl<T, K, readonly K[]>
```

Estende [`ListControl`](list-control.md#listcontrol) — os membros herdados estão documentados lá.

**Exemplo**

```ts
const sizes = new Listbox({ items: ['S', 'M', 'L'], selectionMode: 'multiple' })
<ul {...sizes.parts.root()} onKeyDown={sizes.keydown}>{sizes.collection.keys().map((key) => <li {...sizes.parts.option(key)} onClick={() => sizes.press(key)} />)}</ul>
```

### Construtor

#### `constructor(options: TListboxOptions<T, K>)`

### Propriedades

#### `readonly selectionMode: TSelectionMode`

`single` or `multiple`.

#### `readonly disallowEmpty: boolean`

The last selected option cannot be deselected.

#### `readonly selectedItems: Computed<readonly T[]>`

Items of the selected keys.

### Métodos

#### `select(key: K): boolean`

Selects a key (replacing the selection in single mode).

#### `deselect(key: K): boolean`

Deselects a key.

#### `toggleSelection(key: K): boolean`

Selects or deselects a key.

#### `selectAll(): boolean`

Selects every enabled key (multiple mode).

#### `clearSelection(): boolean`

Deselects everything.

#### `press(key: K): boolean`

Pointer press on an option: highlights it and selects it (toggles it in multiple mode).

#### `parts.root(): TAttributes`

#### `parts.option(key: K): TAttributes`

#### `isSelected(key: K): boolean`

Whether a key is selected. Reactive.

---

## `TSelectionMode`

tipo · [src/headless/listbox/types.ts:4](../../../src/headless/listbox/types.ts#L4)

How many options a `Listbox` keeps selected.

```ts
type TSelectionMode = 'single' | 'multiple'
```

---

## `TListboxOptions`

tipo · [src/headless/listbox/types.ts:7](../../../src/headless/listbox/types.ts#L7)

Options of a `Listbox`. The value is the array of selected keys.

```ts
type TListboxOptions<T, K> = TListControlOptions<T, K, readonly K[]> & {
	/** Default `single`. */
	readonly selectionMode?: TSelectionMode;
	/** Keep at least one option selected. */
	readonly disallowEmpty?: boolean;
}
```
