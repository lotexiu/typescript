import { Computed, computed } from "../computed/model";
import { Subscription } from "../subscription/model";
import { model, Model } from "../model/model";
import { TVariantDerive } from "./types";

class Variant<K, V> extends Subscription<Variant<K,V>> {
	private _prevKey?: K
	private _key: Model<K>
	private _value: Computed<V>

	get key() {return this._key.value}
	get value() {return this._value.value}

	get prevKey() {return this._prevKey}
	get prevValue() {return this._value.prevValue}

	constructor(
		private derive: TVariantDerive<K, V>,
		initial: K
	) {
		super()
		this._key = model(initial)
		this._value = computed(() => this.derive(this._key.value), [this._key])
	}

	set(key: K) {
		const prev = this._key.value
		if (this._key.set(key)) {
			this._prevKey = prev;
			this.notifies(this);
		}
	}
}

function variant<K, V>(derive: TVariantDerive<K, V>, initial: K): Variant<K, V> {
	return new Variant(derive, initial);
}

export {
	Variant,
	variant
}
