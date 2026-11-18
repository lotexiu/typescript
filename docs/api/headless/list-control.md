# `headless/list-control`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`ListControl`](#listcontrol) | classe | Base of the controls over a list of items (`Listbox`, `Select`, `RadioGroup`, `Tabs`, `Menu`, `Combobox`): owns the `collection`, the keyboard `navigation` and the shared arrow/Home/End/typeahead handling. |
| [`TListOrientation`](#tlistorientation) | tipo | Axis of a list: `both` reacts to all four arrows (radio groups). |
| [`TListControlOptions`](#tlistcontroloptions) | tipo | Options of controls built on a list of items: control options + collection accessors + navigation behavior. |

---

## `ListControl`

classe · [src/headless/list-control/model.ts:13](../../../src/headless/list-control/model.ts#L13)

Base of the controls over a list of items (`Listbox`, `Select`, `RadioGroup`, `Tabs`, `Menu`, `Combobox`): owns the `collection`, the keyboard `navigation` and the shared arrow/Home/End/typeahead handling.

```ts
class ListControl<T, K, V> extends Control<V>
```

Estende [`Control`](control.md#control) — os membros herdados estão documentados lá.

### Construtor

#### `constructor(prefix: string, options: TListControlOptions<T, K, V>, fallback: V, defaults: { orientation: TListOrientation; typeahead: boolean })`

### Propriedades

#### `readonly collection: Collection<T, K>`

The items, keyed and labelled.

#### `readonly navigation: Navigation<T, K>`

Which item is highlighted (focused for keyboard purposes).

#### `readonly orientation: TListOrientation`

Which arrows move the highlight.

### Métodos

#### `hover(key: K): boolean`

Highlights an item under the pointer.

#### `itemId(key: K | undefined): string | undefined`

DOM id of an item's element, `<id>-item-<index>`; `undefined` for unknown keys.

---

## `TListOrientation`

tipo · [src/headless/list-control/types.ts:7](../../../src/headless/list-control/types.ts#L7)

Axis of a list: `both` reacts to all four arrows (radio groups).

```ts
type TListOrientation = TOrientation | 'both'
```

---

## `TListControlOptions`

tipo · [src/headless/list-control/types.ts:12](../../../src/headless/list-control/types.ts#L12)

Options of controls built on a list of items: control options + collection accessors + navigation behavior.

```ts
type TListControlOptions<T, K, V> = TControlOptions<V> &
TCollectionOptions<T, K> &
TNavigationOptions & {
	/** Which arrows move the highlight. Each control has its own default. */
	readonly orientation?: TOrientation;
	/** Jump to the next item whose label starts with the typed text. */
	readonly typeahead?: boolean;
}
```
