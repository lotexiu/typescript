import { IndexedItem, ValueHistoryState, ValueHistoryCallBack, ValueHistoryClearCallback } from "./types";

export class ValueHistory<T> {
  private history: T[] = []
  private index: number = 0;

  get canUndo(): boolean {return this.index > 0;}
  get canRedo(): boolean {return this.index < this.history.length - 1;}

  get previous(): IndexedItem<T> {
    return {
      index: this.index - 1,
      value: this.history[this.index - 1]
    }
  }

  get current(): IndexedItem<T> {
    return {
      index: this.index,
      value: this.history[this.index]
    }
  }

  get next(): IndexedItem<T> {
    return {
      index: this.index + 1,
      value: this.history[this.index + 1]
    }
  }

  get state(): ValueHistoryState<T> {
    return {
      previous: this.previous,
      current: this.current,
      next: this.next,
    }
  }

  constructor(
    private cacheSize: number,
    private onBeforeRedo?: ValueHistoryCallBack<T>,
    private onBeforeUndo?: ValueHistoryCallBack<T>,
    private onBeforeRegister?: ValueHistoryCallBack<T>,
    private onBeforeClear?: ValueHistoryClearCallback<T>
  ) {
  }

  clear(): void {
    this.onBeforeClear?.(this.history);
    this.history = [];
    this.index = -1;
  }

  undo(): T | undefined {
    if (!this.canUndo) return undefined;
    this.onBeforeUndo?.(this.state);
    this.index--;
    return this.history[this.index];
  }

  redo(): T | undefined {
    if (!this.canRedo) return undefined;
    this.onBeforeRedo?.(this.state);
    this.index++;
    return this.history[this.index];
  }

  add(item: T): void {
    const state= this.registerState(item)
    this.onBeforeRegister?.(state);
    item = state.new.value as T;
    this.removeFuture();
    this.history.push(item);
    this.index++;
    this.maintainHistorySize();
  }

  private registerState(item: T): ValueHistoryState<T, 'register'> {
    const state = this.state as ValueHistoryState<T, 'register'>;
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
