import { TValueListener, TValueUnsubscribe } from "./types";

class Subscription<T> {
	private listeners = new Set<TValueListener<T>>();

	protected notifies(value: T) {
		this.listeners.forEach((listener) => listener(value));
	}

	subscribe(listener: TValueListener<T>): TValueUnsubscribe {
		this.listeners.add(listener);
		return () => { this.listeners.delete(listener); };
	}

	protected clearListeners(): void {
		this.listeners.clear();
	}
}

export {
	Subscription
}