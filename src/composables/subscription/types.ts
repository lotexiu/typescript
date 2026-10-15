type TValueListener<T> = (value: T) => void;

type TValueUnsubscribe = () => void;

type TSubscription = {
	subscribe(listener: TValueListener<any>): TValueUnsubscribe;
};

// `undefined` (nenhum), a própria função (um) ou um array (vários) — ver `ListenerUtils`.
type TListeners<T> = TValueListener<T> | TValueListener<T>[] | undefined;

export type { TValueListener, TValueUnsubscribe, TSubscription, TListeners };
