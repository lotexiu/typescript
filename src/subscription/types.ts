/** Receives a value. */
type TValueListener<T> = (value: T) => void;

/** Stops listening. */
type TValueUnsubscribe = () => void;

/** Anything you can subscribe to. */
type TSubscription = {
	/** Adds a listener and returns how to remove it. */
	subscribe(listener: TValueListener<any>): TValueUnsubscribe;
};

/** @internal */
type TListeners<T> = TValueListener<T> | TValueListener<T>[] | undefined;

export type { TValueListener, TValueUnsubscribe, TSubscription, TListeners };
