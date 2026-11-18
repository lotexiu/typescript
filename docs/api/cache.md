# `cache`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Cache`](#cache) | classe | A string-keyed cache with optional size limit (least recently used goes first) and optional batches: a batch key joins several keys (`a\|\|b`) and stores their values together, kept in sync with the single entries. |
| [`CacheOptions`](#cacheoptions) | tipo | Options of a `Cache`. |
| [`TCacheGetParam`](#tcachegetparam) | tipo | One or more keys. |
| [`TCacheReturn`](#tcachereturn) | tipo | What `get` returns: a value for one key, an array for several. |

---

## `Cache`

classe · [src/cache/model.ts:7](../../src/cache/model.ts#L7)

A string-keyed cache with optional size limit (least recently used goes first) and optional batches:
a batch key joins several keys (`a||b`) and stores their values together, kept in sync with the single entries.

```ts
class Cache<V>
```

### Construtor

#### `constructor(options: CacheOptions = {})`

Creates an empty cache.

### Propriedades

#### `get size(): number`

Number of entries.

### Métodos

#### `has(key: string): boolean`

Whether a key is cached.

#### `setBatch(batchKey: string, value: V[]): void`

Stores the values of every key in `batchKey` at once (only with `batch: true`).

#### `getBatch(batchKey: string): TCacheReturn<any, V>`

The values of every key in `batchKey`, from the stored batch or from the single entries.

#### `getOrSet(key: string, create: () => V): V`

Returns the cached value, or builds it with `create`, stores it and returns it (also caches `undefined` results).

#### `set(key: string, value: V): void`

Stores a value; with `maxEntries`, may drop the least recently used entry.

#### `get<const Keys extends TCacheGetParam>(...keys: Keys): TCacheReturn<Keys, V>`

One key gives its value (or `undefined`); several keys give the array of their values.

#### `clear(): void`

Removes everything.

#### `delete<const Keys extends TCacheGetParam>(...keys: Keys): void`

Removes the given keys.

#### `keys(): IterableIterator<string>`

Cached keys, least recent first.

#### `values(): IterableIterator<V>`

Cached values, least recent first.

#### `entries(): IterableIterator<[string, V]>`

Cached entries, least recent first.

#### `forEach(callback: (value: V, key: string, map: Map<string, V>) => void): void`

Calls `callback` for each entry.

---

## `CacheOptions`

tipo · [src/cache/types.ts:2](../../src/cache/types.ts#L2)

Options of a `Cache`.

```ts
type CacheOptions = { … }
```

### Propriedades

#### `batch?: boolean`

Enables `setBatch`/`getBatch`. Default `false`.

#### `keySeparator?: string`

Separator of the keys inside a batch key. Default `||`.

#### `maxEntries?: number`

Keeps at most this many entries; the least recently read/written one is dropped first. Unlimited when omitted.

---

## `TCacheGetParam`

tipo · [src/cache/types.ts:12](../../src/cache/types.ts#L12)

One or more keys.

```ts
type TCacheGetParam = [key: string, ...keys: string[]]
```

---

## `TCacheReturn`

tipo · [src/cache/types.ts:15](../../src/cache/types.ts#L15)

What `get` returns: a value for one key, an array for several.

```ts
type TCacheReturn<Keys extends TCacheGetParam, V> = Keys['length'] extends 1 ? V | undefined : Array<V>
```

Estende [`TCacheGetParam`](cache.md#tcachegetparam) — os membros herdados estão documentados lá.
