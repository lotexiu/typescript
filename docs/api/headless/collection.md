# `headless/collection`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Collection`](#collection) | classe | A reactive list of items turned into keyed entries with label and disabled flag, plus the lookups and stepping (skipping disabled items) that lists, selects and menus share. |
| [`TCollectionEntry`](#tcollectionentry) | tipo | One item of a `Collection` with everything the controls need about it. |
| [`TCollectionOptions`](#tcollectionoptions) | tipo | How to read keys, labels and the disabled flag from items. Defaults: a string item is its own key and label; an object uses `value` (or `id`), `label` and `disabled`. |
| [`TDefaultKey`](#tdefaultkey) | tipo | Key type inferred when no `key` accessor is given: `T['value']`, else `T['id']`, else `T` — the same rule used at runtime. |

---

## `Collection`

classe · [src/headless/collection/model.ts:13](../../../src/headless/collection/model.ts#L13)

A reactive list of items turned into keyed entries with label and disabled flag, plus the lookups and stepping (skipping disabled items) that lists, selects and menus share.

```ts
class Collection<T, K = TDefaultKey<T>>
```

**Exemplo**

```ts
const sizes = new Collection({ items: [{ value: 's', label: 'Small' }, { value: 'l', label: 'Large', disabled: true }] })
sizes.enabledKeys() // ['s']
```

### Construtor

#### `constructor(options: TCollectionOptions<T, K>)`

### Propriedades

#### `readonly items: TReactive<readonly T[]>`

The items as given.

#### `readonly entries: Computed<readonly TCollectionEntry<T, K>[]>`

Every item with key, label, disabled flag and index.

#### `readonly keys: Computed<readonly K[]>`

Every key, in order.

#### `readonly enabledKeys: Computed<readonly K[]>`

Keys of the items that are not disabled.

#### `readonly size: Computed<number>`

Number of items.

### Métodos

#### `get(key: K | undefined): TCollectionEntry<T, K> | undefined`

Entry of a key; `undefined` when unknown.

#### `has(key: K | undefined): boolean`

Whether the key exists.

#### `isSelectable(key: K | undefined): boolean`

Whether the key exists and is not disabled.

#### `label(key: K | undefined): string | undefined`

Label of a key.

#### `first(): K | undefined`

First enabled key.

#### `last(): K | undefined`

Last enabled key.

#### `after(key: K | undefined, wrap: boolean): K | undefined`

Next enabled key after `key` (wrapping around when `wrap`); from no key, the first one.

#### `before(key: K | undefined, wrap: boolean): K | undefined`

Previous enabled key before `key` (wrapping around when `wrap`); from no key, the last one.

#### `search(text: string, from: K | undefined, includeFrom: boolean): K | undefined`

First enabled key, after `from`, whose label starts with `text` (case-insensitive), wrapping around. `includeFrom` also tests `from` itself.

---

## `TCollectionEntry`

tipo · [src/headless/collection/types.ts:4](../../../src/headless/collection/types.ts#L4)

One item of a `Collection` with everything the controls need about it.

```ts
type TCollectionEntry<T, K> = { … }
```

### Propriedades

#### `readonly key: K`

Identity of the item; what selections store.

#### `readonly item: T`

The original item.

#### `readonly label: string`

Text shown and used by typeahead and filters.

#### `readonly disabled: boolean`

Cannot be highlighted or chosen.

#### `readonly index: number`

Position in the list.

---

## `TCollectionOptions`

tipo · [src/headless/collection/types.ts:20](../../../src/headless/collection/types.ts#L20)

How to read keys, labels and the disabled flag from items. Defaults: a string item is its own key and label; an object uses `value` (or `id`), `label` and `disabled`.

```ts
type TCollectionOptions<T, K> = { … }
```

### Propriedades

#### `readonly items: TMaybeReactive<readonly T[]>`

The items, static or reactive (a filtered list, data that arrives later).

#### `readonly key?: (item: T) => K`

Identity of an item.

#### `readonly label?: (item: T) => string`

Text of an item.

#### `readonly disabled?: (item: T) => boolean`

Whether an item is disabled.

---

## `TDefaultKey`

tipo · [src/headless/collection/types.ts:44](../../../src/headless/collection/types.ts#L44)

Key type inferred when no `key` accessor is given: `T['value']`, else `T['id']`, else `T` — the same rule used at runtime.

```ts
type TDefaultKey<T> = T extends { readonly value: infer Value } ? Value : T extends { readonly id: infer Id } ? Id : T
```
