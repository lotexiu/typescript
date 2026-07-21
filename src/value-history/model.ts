import { TIndexedItem, TValueHistoryState, TValueHistoryCallBack, TValueHistoryClearCallback, TNewValueHistoryState } from "./types";

/** An undo/redo stack: registers values in sequence, and lets you step back/forward through them. */
class ValueHistory<T> {
  private history: T[] = []
  private index: number = -1;

  get canUndo(): boolean {return this.index > 0;}
  get canRedo(): boolean {return this.index < this.history.length - 1;}

  get previous(): TIndexedItem<T> {
    return {
      index: this.index - 1,
      value: this.history[this.index - 1]
    }
  }

  get current(): TIndexedItem<T> {
    return {
      index: this.index,
      value: this.history[this.index]
    }
  }

  get next(): TIndexedItem<T> {
    return {
      index: this.index + 1,
      value: this.history[this.index + 1]
    }
  }

  get state(): TValueHistoryState<T> {
    return {
      previous: this.previous,
      current: this.current,
      next: this.next,
    }
  }

  constructor(
    private cacheSize: number,
    private onBeforeRedo?: TValueHistoryCallBack<T>,
    private onBeforeUndo?: TValueHistoryCallBack<T>,
    private onBeforeRegister?: TValueHistoryCallBack<T>,
    private onBeforeClear?: TValueHistoryClearCallback<T>
  ) {
  }

  /** Wipes the whole history and resets the cursor. */
  clear(): void {
    this.onBeforeClear?.(this.history);
    this.history = [];
    this.index = -1;
  }

  /** Steps back one entry, or returns `undefined` if there's nothing before the current entry. */
  undo(): T | undefined {
    if (!this.canUndo) return undefined;
    this.onBeforeUndo?.(this.state);
    this.index--;
    return this.history[this.index];
  }

  /** Steps forward one entry, or returns `undefined` if there's nothing after the current entry. */
  redo(): T | undefined {
    if (!this.canRedo) return undefined;
    this.onBeforeRedo?.(this.state);
    this.index++;
    return this.history[this.index];
  }

  /** Registers a new entry, discarding any redo-able future and trimming to `cacheSize` if needed. */
  add(item: T): void {
    const state= this.registerState(item)
    this.onBeforeRegister?.(state);
    item = state.new.value as T;
    this.removeFuture();
    this.history.push(item);
    this.index++;
    this.maintainHistorySize();
  }

  private registerState(item: T): TNewValueHistoryState<T> {
    const state = this.state as TNewValueHistoryState<T>;
    state.new = {
      index: this.index + 1,
      value: item
    }
    return state
  }

  private removeFuture(): void {
    this.history = this.history.slice(0, this.index + 1);
  }

  private maintainHistorySize() {
    if (this.history.length > this.cacheSize) {
      this.history.shift();
      this.index--;
    }
  }
}

export {
  ValueHistory
}