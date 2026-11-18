# `headless/tabs`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Tabs`](#tabs) | classe | Tabs and their panels. `automatic` activation selects as the arrows move; `manual` only moves the focus until Enter/Space. With no valid value the first enabled tab is selected. Move the DOM focus to `navigation.active()` when it changes. |
| [`TTabsActivation`](#ttabsactivation) | tipo | Whether moving the focus also selects (`automatic`) or waits for Enter/Space (`manual`). |
| [`TTabsOptions`](#ttabsoptions) | tipo | Options of `Tabs`. The value is the selected key. |

---

## `Tabs`

classe · [src/headless/tabs/model.ts:16](../../../src/headless/tabs/model.ts#L16)

Tabs and their panels. `automatic` activation selects as the arrows move; `manual` only moves the focus until Enter/Space.
With no valid value the first enabled tab is selected. Move the DOM focus to `navigation.active()` when it changes.

Anatomy: `parts.list()` (`role="tablist"`), `parts.tab(key)`, `parts.panel(key)`.

```ts
class Tabs<T, K = TDefaultKey<T>> extends ListControl<T, K, K | undefined>
```

Estende [`ListControl`](list-control.md#listcontrol) — os membros herdados estão documentados lá.

### Construtor

#### `constructor(options: TTabsOptions<T, K>)`

### Propriedades

#### `readonly activation: TTabsActivation`

`automatic` or `manual`.

#### `readonly selected: Computed<K | undefined>`

The selected tab: the value when valid, otherwise the first enabled tab.

### Métodos

#### `choose(key: K): boolean`

Selects a tab.

#### `parts.list(): TAttributes`

#### `parts.tab(key: K): TAttributes`

#### `parts.panel(key: K): TAttributes`

#### `panelId(key: K): string | undefined`

Id of a tab's panel.

---

## `TTabsActivation`

tipo · [src/headless/tabs/types.ts:4](../../../src/headless/tabs/types.ts#L4)

Whether moving the focus also selects (`automatic`) or waits for Enter/Space (`manual`).

```ts
type TTabsActivation = 'automatic' | 'manual'
```

---

## `TTabsOptions`

tipo · [src/headless/tabs/types.ts:7](../../../src/headless/tabs/types.ts#L7)

Options of `Tabs`. The value is the selected key.

```ts
type TTabsOptions<T, K> = TListControlOptions<T, K, K | undefined> & {
	/** Default `automatic`. */
	readonly activation?: TTabsActivation;
}
```
