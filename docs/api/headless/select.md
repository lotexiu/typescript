# `headless/select`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Select`](#select) | classe | A button that opens a list and shows the chosen option (the APG "select-only combobox"). Closed: arrows, Enter or Space open it; typing jumps to an option. Open: arrows/Home/End move, Enter/Space choose, Escape closes, Tab chooses and moves on. |
| [`TSelectOptions`](#tselectoptions) | tipo | Options of a `Select`. The value is the chosen key. |

---

## `Select`

classe · [src/headless/select/model.ts:20](../../../src/headless/select/model.ts#L20)

A button that opens a list and shows the chosen option (the APG "select-only combobox").
Closed: arrows, Enter or Space open it; typing jumps to an option. Open: arrows/Home/End move, Enter/Space choose, Escape closes, Tab chooses and moves on.

Anatomy: `parts.label()`, `parts.trigger()` (`role="combobox"`, focus stays here), `parts.listbox()`, `parts.option(key)`.

```ts
class Select<T, K = TDefaultKey<T>> extends ListControl<T, K, K | undefined>
```

Estende [`ListControl`](list-control.md#listcontrol) — os membros herdados estão documentados lá.

**Exemplo**

```ts
const size = new Select({ items: [{ value: 's', label: 'Small' }, { value: 'l', label: 'Large' }] })
size.selectedLabel() // undefined until something is chosen
```

### Construtor

#### `constructor(options: TSelectOptions<T, K>)`

### Propriedades

#### `readonly open: TWritable<boolean>`

Whether the list is shown. Controlled when a writable was passed.

#### `readonly labelId: string`

Id of the label element.

#### `readonly listboxId: string`

Id of the list element.

#### `readonly state: Computed<'open' | 'closed'>`

`open` or `closed`.

#### `readonly layers: LayerStack`

Stack used to decide which overlay is on top.

#### `readonly isTop: Computed<boolean>`

True while this is the most recently opened overlay; only then do Escape and clicks outside close it.

#### `readonly selectedItem: Computed<T | undefined>`

Item of the chosen key.

#### `readonly selectedLabel: Computed<string | undefined>`

Label of the chosen key — what the trigger shows.

### Métodos

#### `show(): boolean`

Opens, highlighting the chosen option (or the first).

#### `hide(): void`

Closes.

#### `toggleOpen(): boolean`

Opens when closed, closes when open — the trigger's click.

#### `choose(key: K): boolean`

Chooses an option and closes.

#### `clear(): boolean`

Clears the choice.

#### `interactOutside(): boolean`

Call on a pointer down outside trigger and list. Closes when on top.

#### `parts.label(): TAttributes`

#### `parts.trigger(): TAttributes`

#### `parts.listbox(): TAttributes`

#### `parts.option(key: K): TAttributes`

---

## `TSelectOptions`

tipo · [src/headless/select/types.ts:6](../../../src/headless/select/types.ts#L6)

Options of a `Select`. The value is the chosen key.

```ts
type TSelectOptions<T, K> = TListControlOptions<T, K, K | undefined> & {
	/** Initial open state, or a writable to control it. */
	readonly open?: boolean | TWritable<boolean>;
	/** Stack used to decide which overlay is on top. Default `LayerStack.shared`. */
	readonly layers?: LayerStack;
}
```
