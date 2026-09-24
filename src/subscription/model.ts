import { TListeners, TValueListener, TValueUnsubscribe } from './types';
import { ListenerUtils } from './utils';

// Emissor de eventos sem valor guardado — para estado (valor atual + derivados), usar `signal`.
class Subscription<T = void> {
	#listeners: TListeners<T> = undefined;

	subscribe(listener: TValueListener<T>): TValueUnsubscribe {
		this.#listeners = ListenerUtils.add(this.#listeners, listener);
		let active = true;
		return () => {
			if (!active) return;
			active = false;
			this.#listeners = ListenerUtils.remove(this.#listeners, listener);
		};
	}

	notify(value: T): void {
		ListenerUtils.call(this.#listeners, value);
	}

	dispose(): void {
		this.#listeners = undefined;
	}
}

export { Subscription };
