import { Computed, computed } from "../computed/model";
import { Subscription } from "../subscription/model";
import { model, Model } from "../model/model";
import { TVariantDerive } from "./types";

class Variant<K, V> extends Subscription<Variant<K,V>> {
	#prevKey?: K
	readonly #key: Model<K>
	readonly #value: Computed<V>
	readonly #derive: TVariantDerive<K, V>

	get key() {return this.#key.value}
	get value() {return this.#value.value}

	get prevKey() {return this.#prevKey}
	get prevValue() {return this.#value.prevValue}

	constructor(
		derive: TVariantDerive<K, V>,
		initial: K
	) {
		super()
		this.#derive = derive
		this.#key = model(initial)
		this.#value = computed(() => this.#derive(this.#key.value), [this.#key])
	}

	set(key: K) {
		const prev = this.#key.value
		if (this.#key.set(key)) {
			this.#prevKey = prev;
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
