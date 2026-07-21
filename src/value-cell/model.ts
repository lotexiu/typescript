import { TValueCellListener, TValueCellUnsubscribe } from "./types";

/**
 * Menor primitivo reativo da lib: guarda um valor e notifica assinantes quando ele muda.
 * Não sabe de UI/DOM e não é um plugin — é a peça que plugins "adaptadores de util"
 * (ex.: MaskPlugin) usam por baixo para virar reativos sem reimplementar notify-on-change.
 */
class ValueCell<T> {
	private listeners = new Set<TValueCellListener<T>>();

	constructor(private _value: T) {}

	get value(): T { return this._value; }

	/** Sets the value and notifies subscribers — a no-op (no notification) if `next` is `Object.is`-equal to the current value. */
	set(next: T): void {
		if (Object.is(next, this._value)) return;
		this._value = next;
		this.listeners.forEach((listener) => listener(next));
	}

	/** Subscribes to value changes. Returns an unsubscribe function. */
	subscribe(listener: TValueCellListener<T>): TValueCellUnsubscribe {
		this.listeners.add(listener);
		return () => { this.listeners.delete(listener); };
	}
}

export {
	ValueCell
}
