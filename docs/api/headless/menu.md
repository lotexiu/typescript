# `headless/menu`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Menu`](#menu) | classe | A button that opens a list of actions (the APG "menu button"). `value` is whether the menu is open; activating an item calls `onAction` and records it in `lastAction`. |
| [`TMenuOptions`](#tmenuoptions) | tipo | Options of a `Menu`. The value is whether the menu is open. |

---

## `Menu`

classe · [src/headless/menu/model.ts:19](../../../src/headless/menu/model.ts#L19)

A button that opens a list of actions (the APG "menu button"). `value` is whether the menu is open; activating an
item calls `onAction` and records it in `lastAction`.

```ts
class Menu<T, K = TDefaultKey<T>> extends ListControl<T, K, boolean>
```

Estende [`ListControl`](list-control.md#listcontrol) — os membros herdados estão documentados lá.

**Exemplo**

```ts
const menu = new Menu({ items: ['copy', 'paste'], onAction: (key) => run(key) })
<button {...menu.parts.trigger()} onKeyDown={menu.keydown} onClick={menu.toggle} />
<ul {...menu.parts.menu()} onKeyDown={menu.keydown}>{keys.map((key) => <li {...menu.parts.item(key)} onClick={() => menu.activate(key)} />)}</ul>
```

### Construtor

#### `constructor(options: TMenuOptions<T, K>)`

### Propriedades

#### `readonly menuId: string`

Id of the menu element.

#### `readonly closeOnAction: boolean`

Closes after an item is activated.

#### `readonly layers: LayerStack`

Stack used to decide which overlay is on top.

#### `readonly state: Computed<'open' | 'closed'>`

`open` or `closed`.

#### `readonly isTop: Computed<boolean>`

True while this is the most recently opened overlay; only then do Escape and clicks outside close it.

#### `readonly lastAction: Signal<K | undefined>`

The key of the last activated item.

### Métodos

#### `show(highlight: 'first' | 'last' = 'first'): boolean`

Opens with `'first'` (default) or `'last'` item highlighted.

#### `hide(): void`

Closes and drops the highlight.

#### `toggle(): boolean`

Opens when closed, closes when open.

#### `activate(key: K): boolean`

Runs an item: records it in `lastAction`, calls `onAction` and closes (unless `closeOnAction` is false). Ignores disabled items.

#### `interactOutside(): boolean`

Call on a pointer down outside the trigger and the menu. Only closes when this menu is on top.

#### `parts.trigger(): TAttributes`

#### `parts.menu(): TAttributes`

#### `parts.item(key: K): TAttributes`

---

## `TMenuOptions`

tipo · [src/headless/menu/types.ts:5](../../../src/headless/menu/types.ts#L5)

Options of a `Menu`. The value is whether the menu is open.

```ts
type TMenuOptions<T, K> = TListControlOptions<T, K, boolean> & {
	/** Called when an item is activated (click, Enter or Space). */
	readonly onAction?: (key: NoInfer<K>, item: NoInfer<T>) => void;
	/** Close after an item is activated. Default `true`. */
	readonly closeOnAction?: boolean;
	/** Stack used to decide which overlay is on top. Default `LayerStack.shared`. */
	readonly layers?: LayerStack;
}
```
