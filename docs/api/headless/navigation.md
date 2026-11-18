# `headless/navigation`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Navigation`](#navigation) | classe | The highlighted item of a list, by key: next/previous/first/last skipping disabled items, and typeahead. The highlight is dropped when its item disappears or becomes disabled. |
| [`TNavigationOptions`](#tnavigationoptions) | tipo | How the highlight moves through a list. |

---

## `Navigation`

classe · [src/headless/navigation/model.ts:10](../../../src/headless/navigation/model.ts#L10)

The highlighted item of a list, by key: next/previous/first/last skipping disabled items, and typeahead. The highlight is dropped when its item disappears or becomes disabled.

```ts
class Navigation<T, K>
```

### Construtor

#### `constructor(collection: Collection<T, K>, options: TNavigationOptions = {})`

### Propriedades

#### `readonly collection: Collection<T, K>`

The list being navigated.

#### `readonly active: Computed<K | undefined>`

Highlighted key, or `undefined`.

#### `readonly wrap: boolean`

Whether moving past an end goes around.

### Métodos

#### `setActive(key: K | undefined): boolean`

Highlights a key (or clears with `undefined`). Refuses unknown or disabled keys.

#### `clear(): void`

Removes the highlight.

#### `first(): boolean`

Highlights the first enabled item.

#### `last(): boolean`

Highlights the last enabled item.

#### `next(): boolean`

Highlights the next enabled item (the first, when nothing is highlighted).

#### `previous(): boolean`

Highlights the previous enabled item (the last, when nothing is highlighted).

#### `typeahead(character: string): boolean`

Feeds one typed character. Characters typed in quick succession form a prefix; repeating the same letter cycles through the items starting with it.

---

## `TNavigationOptions`

tipo · [src/headless/navigation/types.ts:2](../../../src/headless/navigation/types.ts#L2)

How the highlight moves through a list.

```ts
type TNavigationOptions = { … }
```

### Propriedades

#### `readonly wrap?: boolean`

Moving past either end goes around. Default `true`.

#### `readonly now?: () => number`

Clock used to group typed characters; inject one in tests.
