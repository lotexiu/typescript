# `headless/radio-group`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`RadioGroup`](#radiogroup) | classe | One option out of a few, all visible. Arrows move and select at once (wrapping, skipping disabled radios); only one radio is in the tab order. Move the DOM focus to `navigation.active()` when it changes. |
| [`TRadioGroupOptions`](#tradiogroupoptions) | tipo | Options of a `RadioGroup`. The value is the checked key. |

---

## `RadioGroup`

classe · [src/headless/radio-group/model.ts:17](../../../src/headless/radio-group/model.ts#L17)

One option out of a few, all visible. Arrows move and select at once (wrapping, skipping disabled radios); only one radio is in the tab order.
Move the DOM focus to `navigation.active()` when it changes.

Anatomy: `parts.root()` on the group (`role="radiogroup"`), `parts.item(key)` on each radio.

```ts
class RadioGroup<T, K = TDefaultKey<T>> extends ListControl<T, K, K | undefined>
```

Estende [`ListControl`](list-control.md#listcontrol) — os membros herdados estão documentados lá.

### Construtor

#### `constructor(options: TRadioGroupOptions<T, K>)`

### Propriedades

#### `readonly required: TReactive<boolean>`

Whether a choice is required.

#### `readonly focusable: Computed<K | undefined>`

The radio that gets `tabindex=0`: the checked one, or the first enabled.

#### `readonly selectedItem: Computed<T | undefined>`

Item of the checked key.

### Métodos

#### `choose(key: K): boolean`

Checks a radio and highlights it.

#### `parts.root(): TAttributes`

#### `parts.item(key: K): TAttributes`

---

## `TRadioGroupOptions`

tipo · [src/headless/radio-group/types.ts:5](../../../src/headless/radio-group/types.ts#L5)

Options of a `RadioGroup`. The value is the checked key.

```ts
type TRadioGroupOptions<T, K> = TListControlOptions<T, K, K | undefined> & {
	/** Marks the group as required (`aria-required`). */
	readonly required?: TMaybeReactive<boolean>;
}
```
