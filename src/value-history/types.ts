/** A value paired with its position in `ValueHistory`'s stack. */
type TIndexedItem<T> = {
  index: number;
  value: T;
};

/** The kind of history-changing action being reported (currently just `'register'`, or `false` for none). */
type TValueHistoryType = 'register' | false

/** A snapshot of `ValueHistory`'s undo/redo neighborhood around the current position. */
interface TValueHistoryState<T> {
  previous?: TIndexedItem<T>
  current?: TIndexedItem<T>
  next?: TIndexedItem<T>
}

/** `TValueHistoryState` plus the value that was just registered — passed to change listeners. */
interface TNewValueHistoryState<T> extends TValueHistoryState<T> {
  new: TIndexedItem<T>
}

/** Listener signature for `ValueHistory` state changes. */
type TValueHistoryCallBack<T> = (state: TValueHistoryState<T>) => void;

/** Listener signature for `ValueHistory` being cleared — receives the full history that was discarded. */
type TValueHistoryClearCallback<T> = (history: (T)[]) => void;


export type {
  TIndexedItem,
  TValueHistoryType,
  TValueHistoryState,
  TNewValueHistoryState,
  TValueHistoryCallBack,
  TValueHistoryClearCallback
}
