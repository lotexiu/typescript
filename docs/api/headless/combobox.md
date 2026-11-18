# `headless/combobox`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Combobox`](#combobox) | classe | An editable input with a filtered list of options (APG combobox with list autocomplete). `value` is the chosen key; `inputValue` is the text. Typing filters and opens; arrows move; Enter chooses; Escape closes, then clears. |
| [`TComboboxFilter`](#tcomboboxfilter) | tipo | Decides whether an option stays visible for the typed text. |
| [`TComboboxOptions`](#tcomboboxoptions) | tipo | Options of a `Combobox`. |
| [`ComboboxUtils`](#comboboxutils) | classe | Ready-made filters for `Combobox`. |

---

## `Combobox`

classe · [src/headless/combobox/model.ts:20](../../../src/headless/combobox/model.ts#L20)

An editable input with a filtered list of options (APG combobox with list autocomplete). `value` is the chosen key;
`inputValue` is the text. Typing filters and opens; arrows move; Enter chooses; Escape closes, then clears.

```ts
class Combobox<T, K = TDefaultKey<T>> extends ListControl<T, K, K | undefined>
```

Estende [`ListControl`](list-control.md#listcontrol) — os membros herdados estão documentados lá.

**Exemplo**

```ts
const city = new Combobox({ items: cities })
<input {...city.parts.input()} value={city.inputValue()} onChange={(event) => city.input(event.target.value)} onKeyDown={city.keydown} onBlur={city.commit} />
```

### Construtor

#### `constructor(options: TComboboxOptions<T, K>)`

### Propriedades

#### `readonly open: TWritable<boolean>`

Whether the list is shown. Controlled when a writable was passed.

#### `readonly inputValue: TWritable<string>`

The text in the input.

#### `readonly allOptions: Collection<T, K>`

Every option, filtered or not. `collection` holds only the visible ones.

#### `readonly allowCustomValue: boolean`

Typed text that matches no option is kept on `commit`.

#### `readonly layers: LayerStack`

Stack used to decide which overlay is on top.

#### `readonly labelId: string`

Id of the label element.

#### `readonly listboxId: string`

Id of the list element.

#### `readonly state: Computed<'open' | 'closed'>`

`open` or `closed`.

#### `readonly isTop: Computed<boolean>`

True while this is the most recently opened overlay; only then do Escape and clicks outside close it.

#### `readonly empty: Computed<boolean>`

True when the list is open but nothing matches — show a "no results" message.

#### `readonly selectedItem: Computed<T | undefined>`

Item of the chosen key.

#### `readonly selectedLabel: Computed<string | undefined>`

Label of the chosen key.

### Métodos

#### `input(text: string): boolean`

Call on every input change (the text as the user left it).

#### `show(): boolean`

Opens the list showing every option, highlighting the chosen one (or the first).

#### `hide(): void`

Closes the list.

#### `toggleOpen(): boolean`

Opens when closed, closes when open — for a toggle button next to the input.

#### `choose(key: K): boolean`

Chooses an option: stores its key, writes its label in the input and closes.

#### `clear(): boolean`

Clears the choice and the text.

#### `commit(): void`

Call when the input loses focus: closes and, unless `allowCustomValue`, puts back the chosen option's label.

#### `interactOutside(): boolean`

Call on a pointer down outside the input and the list. Commits and closes when on top.

#### `parts.label(): TAttributes`

#### `parts.input(): TAttributes`

#### `parts.toggle(): TAttributes`

#### `parts.listbox(): TAttributes`

#### `parts.option(key: K): TAttributes`

---

## `TComboboxFilter`

tipo · [src/headless/combobox/types.ts:6](../../../src/headless/combobox/types.ts#L6)

Decides whether an option stays visible for the typed text.

```ts
type TComboboxFilter = (label: string, text: string) => boolean
```

---

## `TComboboxOptions`

tipo · [src/headless/combobox/types.ts:9](../../../src/headless/combobox/types.ts#L9)

Options of a `Combobox`.

```ts
type TComboboxOptions<T, K> = TListControlOptions<T, K, K | undefined> & {
	/** Initial open state, or a writable to control it. */
	readonly open?: boolean | TWritable<boolean>;
	/** The text in the input. Pass a signal to control it from outside. */
	readonly inputValue?: string | TWritable<string>;
	/** Default: contains, ignoring case and accents. */
	readonly filter?: TComboboxFilter;
	/** Keep typed text that matches no option when the input loses focus. Default `false`: the text goes back to the chosen option's label. */
	readonly allowCustomValue?: boolean;
	/** Stack used to decide which overlay is on top. Default `LayerStack.shared`. */
	readonly layers?: LayerStack;
}
```

---

## `ComboboxUtils`

classe · [src/headless/combobox/utils.ts:4](../../../src/headless/combobox/utils.ts#L4)

Ready-made filters for `Combobox`.

```ts
class ComboboxUtils
```

### Estáticos

#### `static fold(text: string): string`

Folds case and accents, so `'sao'` matches `'São Paulo'`.

#### `static contains(label: string, text: string): boolean`

Default filter: the label contains the typed text, ignoring case and accents. Empty text keeps everything.

#### `static startsWith(label: string, text: string): boolean`

Alternative filter: the label starts with the typed text, ignoring case and accents.
