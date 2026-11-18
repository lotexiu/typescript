# `value-history`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`ValueHistory`](#valuehistory) | classe | Undo/redo over a list of values: `add` drops the redo branch, `cacheSize` limits how many are kept. |
| [`TIndexedValue`](#tindexedvalue) | tipo | A value paired with its position in `ValueHistory`'s stack. |
| [`TValueHistoryType`](#tvaluehistorytype) | tipo | The kind of history-changing action being reported (currently just `'register'`, or `false` for none). |
| [`TValueHistoryState`](#tvaluehistorystate) | interface | A snapshot of `ValueHistory`'s undo/redo neighborhood around the current position. |
| [`TNewValueHistoryState`](#tnewvaluehistorystate) | interface | `TValueHistoryState` plus the value that was just registered — passed to change listeners. |
| [`TValueHistoryCallBack`](#tvaluehistorycallback) | tipo | Listener signature for `ValueHistory` state changes. |
| [`TValueHistoryClearCallback`](#tvaluehistoryclearcallback) | tipo | Listener signature for `ValueHistory` being cleared — receives the full history that was discarded. |

---

## `ValueHistory`

classe · [src/value-history/model.ts:6](../../src/value-history/model.ts#L6)

Undo/redo over a list of values: `add` drops the redo branch, `cacheSize` limits how many are kept.

```ts
class ValueHistory<T>
```

### Construtor

#### `constructor(public cacheSize: number = -1)`

Creates an empty history; `cacheSize` -1 keeps everything.

### Propriedades

#### `readonly index = signal(-1)`

Position of the current value (-1 when empty or fully undone).

#### `readonly previous = computed(() => this.#at(this.index() - 1))`

Value before the current one.

#### `readonly current = computed(() => this.#at(this.index()))`

Current value.

#### `readonly next = computed(() => this.#at(this.index() + 1))`

Value after the current one (what `redo` goes to).

#### `readonly canUndo = computed(() => this.index() >= 0)`

`undo()` would move (it can step back to `index === -1`, the state before the first entry).

#### `readonly canRedo = computed(() => this.index() < this.#entries().length - 1)`

Whether there is something to redo.

#### `readonly length = computed(() => this.#entries().length)`

Number of values kept.

#### `readonly history`

Every value with its index.

### Métodos

#### `undo(): void`

Moves one value back.

#### `redo(): void`

Moves one value forward.

#### `add(value: T): void`

Adds a value after the current one, dropping what could be redone.

---

## `TIndexedValue`

tipo · [src/value-history/types.ts:2](../../src/value-history/types.ts#L2)

A value paired with its position in `ValueHistory`'s stack.

```ts
type TIndexedValue<T> = { … }
```

### Propriedades

#### `index: number`

Position in the history.

#### `value: T`

The value.

---

## `TValueHistoryType`

tipo · [src/value-history/types.ts:10](../../src/value-history/types.ts#L10)

The kind of history-changing action being reported (currently just `'register'`, or `false` for none).

```ts
type TValueHistoryType = 'register' | false
```

---

## `TValueHistoryState`

interface · [src/value-history/types.ts:13](../../src/value-history/types.ts#L13)

A snapshot of `ValueHistory`'s undo/redo neighborhood around the current position.

```ts
interface TValueHistoryState<T>
```

### Propriedades

#### `previous?: TIndexedValue<T>`

Value before.

#### `current?: TIndexedValue<T>`

Current value.

#### `next?: TIndexedValue<T>`

Value after.

---

## `TNewValueHistoryState`

interface · [src/value-history/types.ts:23](../../src/value-history/types.ts#L23)

`TValueHistoryState` plus the value that was just registered — passed to change listeners.

```ts
interface TNewValueHistoryState<T> extends TValueHistoryState<T>
```

Estende [`TValueHistoryState`](value-history.md#tvaluehistorystate) — os membros herdados estão documentados lá.

### Propriedades

#### `new: TIndexedValue<T>`

The value just added.

---

## `TValueHistoryCallBack`

tipo · [src/value-history/types.ts:29](../../src/value-history/types.ts#L29)

Listener signature for `ValueHistory` state changes.

```ts
type TValueHistoryCallBack<T> = (state: TValueHistoryState<T>) => void
```

---

## `TValueHistoryClearCallback`

tipo · [src/value-history/types.ts:32](../../src/value-history/types.ts#L32)

Listener signature for `ValueHistory` being cleared — receives the full history that was discarded.

```ts
type TValueHistoryClearCallback<T> = (history: (T)[]) => void
```
