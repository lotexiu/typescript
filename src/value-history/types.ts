import { TMap } from "@tsn-object/generic/types";


type IndexedItem<T> = {
  index: number;
  value: T;
};

type ValueHistoryType = 'register' | false

type ValueHistoryState<T, Info extends ValueHistoryType = false> = {
  previous?: IndexedItem<T>
  current?: IndexedItem<T>
  next?: IndexedItem<T>
} & TMap<Info, {}, [
  ['register', {
    new: IndexedItem<T>
  }]
]>

type ValueHistoryCallBack<T> = (state: ValueHistoryState<T>) => void;

type ValueHistoryClearCallback<T> = (history: (T)[]) => void;


export type {
  IndexedItem,
  ValueHistoryType,
  ValueHistoryState,
  ValueHistoryCallBack,
  ValueHistoryClearCallback
}
