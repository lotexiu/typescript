import { Model } from "../model/model";
import { TValueListener, TValueUnsubscribe } from "../model/types";
import { TVariant, TVariantDerive } from "./types";

class Variant<K, V> {
	private _value: Model<TVariant<K, V>>;

	constructor(
		private derive: TVariantDerive<K, V>,
		initial: K
	) {
		this._value = new Model({ key: initial, value: derive(initial) })
	}

	get active(): K { return this._value.value.key; }

	get value(): V { return this._value.value.value; }

	set(name: K): void { this._value.set({ key: name, value: this.derive(name) }); }

	notifies(): void { this._value.notifies(); }

	subscribe(listener: TValueListener<TVariant<K, V>>): TValueUnsubscribe {
		return this._value.subscribe(listener);
	}
}

function variant<K, V>(derive: TVariantDerive<K, V>, initial: K): Variant<K, V> {
	return new Variant(derive, initial);
}

export {
	Variant,
	variant
}
