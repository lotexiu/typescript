/** Listener signature `ValueCell.subscribe(...)` accepts. */
type TValueListener<T> = (value: T) => void;

/** The unsubscribe function `ValueCell.subscribe(...)` returns. */
type TValueUnsubscribe = () => void;

type TSubscription = {
	subscribe(listener: TValueListener<any>): TValueUnsubscribe
}

export type {
	TValueListener,
	TValueUnsubscribe,
	TSubscription,
}
