import { TListeners, TValueListener, TValueUnsubscribe } from './types';
import { ListenerUtils } from './utils';

/**
 * An event emitter that keeps no value (use `signal` for state). A listener that throws does not stop the others.
 */
class Subscription<T = void> {
	#listeners: TListeners<T> = undefined;

	/** Adds a listener. Returns the function that removes it. */
	subscribe(listener: TValueListener<T>): TValueUnsubscribe {
		this.#listeners = ListenerUtils.add(this.#listeners, listener);
		let active = true;
		return () => {
			if (!active) return;
			active = false;
			this.#listeners = ListenerUtils.remove(this.#listeners, listener);
		};
	}

	/** Calls every listener with `value`. */
	notify(value: T): void {
		ListenerUtils.call(this.#listeners, value);
	}

	/** Removes every listener. */
	dispose(): void {
		this.#listeners = undefined;
	}
}

export { Subscription };
