/** Listener signature `ValueCell.subscribe(...)` accepts. */
type TValueCellListener<T> = (value: T) => void;

/** The unsubscribe function `ValueCell.subscribe(...)` returns. */
type TValueCellUnsubscribe = () => void;

export type {
	TValueCellListener,
	TValueCellUnsubscribe,
}
