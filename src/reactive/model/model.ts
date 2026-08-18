import { TValueListener, TValueUnsubscribe } from "./types";

/**
 * Menor primitivo reativo da lib: guarda um valor e notifica assinantes quando ele muda.
 * Não sabe de UI/DOM e não é um plugin — é a peça que plugins "adaptadores de util"
 * (ex.: MaskPlugin) usam por baixo para virar reativos sem reimplementar notify-on-change.
 */
class Model<T> {
	private listeners = new Set<TValueListener<T>>();

	constructor(private _value: T) {}

	get value() { return this._value; }

	/** Sets the value and notifies subscribers — a no-op (no notification) if `next` is `Object.is`-equal to the current value. */
	set(next: T): T {
		if (Object.is(next, this._value)) return next;
		const previous = this._value;
		this._value = next;
		this.notifies(previous);
		return next;
	}

	silentSet(next: T): T {
		if (Object.is(next, this._value)) return next;
		this._value = next;
		return next;
	}

	notifies(prevValue?: T) {
		this.listeners.forEach((listener) => listener(this._value, prevValue));
	}

	/** Subscribes to value changes. Returns an unsubscribe function. */
	subscribe(listener: TValueListener<T>): TValueUnsubscribe {
		this.listeners.add(listener);
		return () => { this.listeners.delete(listener); };
	}
}

function model<T>(initial: T): Model<T> {
	return new Model(initial);
}

export {
	Model,
	model
}