/** A value paired with its position in `ValueHistory`'s stack. */
type TIndexedValue<T> = {
  /** Position in the history. */
  index: number;
  /** The value. */
  value: T;
};

/** The kind of history-changing action being reported (currently just `'register'`, or `false` for none). */
type TValueHistoryType = 'register' | false

/** A snapshot of `ValueHistory`'s undo/redo neighborhood around the current position. */
interface TValueHistoryState<T> {
  /** Value before. */
  previous?: TIndexedValue<T>
  /** Current value. */
  current?: TIndexedValue<T>
  /** Value after. */
  next?: TIndexedValue<T>
}

/** `TValueHistoryState` plus the value that was just registered — passed to change listeners. */
interface TNewValueHistoryState<T> extends TValueHistoryState<T> {
  /** The value just added. */
  new: TIndexedValue<T>
}

/** Listener signature for `ValueHistory` state changes. */
type TValueHistoryCallBack<T> = (state: TValueHistoryState<T>) => void;

/** Listener signature for `ValueHistory` being cleared — receives the full history that was discarded. */
type TValueHistoryClearCallback<T> = (history: (T)[]) => void;


export type {
  TIndexedValue,
  TValueHistoryType,
  TValueHistoryState,
  TNewValueHistoryState,
  TValueHistoryCallBack,
  TValueHistoryClearCallback
}
