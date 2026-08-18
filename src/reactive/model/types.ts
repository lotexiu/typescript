/** Listener signature `ValueCell.subscribe(...)` accepts. */
type TValueListener<T> = (value: T, prevValue?: T) => void;

/** The unsubscribe function `ValueCell.subscribe(...)` returns. */
type TValueUnsubscribe = () => void;

export type {
	TValueListener,
	TValueUnsubscribe,
}
