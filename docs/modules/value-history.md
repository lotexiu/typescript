[← Voltar para PROJECT.md](../PROJECT.md)

# value-history

<a id="ValueHistory"></a>
#### [`ValueHistory`](../../src/value-history/model.ts#L4) _(class)_

An undo/redo stack: registers values in sequence, and lets you step back/forward through them.

<a id="ValueHistory.clear"></a>
- [`clear`](../../src/value-history/model.ts#L50)
  Wipes the whole history and resets the cursor.
<a id="ValueHistory.undo"></a>
- [`undo`](../../src/value-history/model.ts#L57)
  Steps back one entry, or returns `undefined` if there's nothing before the current entry.
<a id="ValueHistory.redo"></a>
- [`redo`](../../src/value-history/model.ts#L65)
  Steps forward one entry, or returns `undefined` if there's nothing after the current entry.
<a id="ValueHistory.add"></a>
- [`add`](../../src/value-history/model.ts#L73)
  Registers a new entry, discarding any redo-able future and trimming to `cacheSize` if needed.

<a id="TIndexedItem"></a>
#### [`TIndexedItem`](../../src/value-history/types.ts#L2) _(type, type-only)_

A value paired with its position in `ValueHistory`'s stack.

<a id="TValueHistoryType"></a>
#### [`TValueHistoryType`](../../src/value-history/types.ts#L8) _(type, type-only)_

The kind of history-changing action being reported (currently just `'register'`, or `false` for none).

<a id="TValueHistoryState"></a>
#### [`TValueHistoryState`](../../src/value-history/types.ts#L11) _(interface, type-only)_

A snapshot of `ValueHistory`'s undo/redo neighborhood around the current position.

<a id="TNewValueHistoryState"></a>
#### [`TNewValueHistoryState`](../../src/value-history/types.ts#L18) _(interface, type-only)_

`TValueHistoryState` plus the value that was just registered — passed to change listeners.

<a id="TValueHistoryCallBack"></a>
#### [`TValueHistoryCallBack`](../../src/value-history/types.ts#L23) _(type, type-only)_

Listener signature for `ValueHistory` state changes.

<a id="TValueHistoryClearCallback"></a>
#### [`TValueHistoryClearCallback`](../../src/value-history/types.ts#L26) _(type, type-only)_

Listener signature for `ValueHistory` being cleared — receives the full history that was discarded.
