import { TValueListener, TValueUnsubscribe } from "./types";

abstract class Subscription<T> {
	private listeners = new Set<TValueListener<T>>();

	protected notifies(value: T) {
		this.listeners.forEach((listener) => listener(value));
	}

	subscribe(listener: TValueListener<T>): TValueUnsubscribe {
		this.listeners.add(listener);
		return () => { this.listeners.delete(listener); };
	}

	protected dispose(): void {
		this.listeners.clear();
	}
}

class SubscriptionController<T> extends Subscription<T> {
	notifies(value: T): void {super.notifies(value)}
	dispose(): void {super.dispose()}
}

export {
	Subscription,
	SubscriptionController
}