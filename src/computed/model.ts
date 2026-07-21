import { TValueUnsubscribe } from "@ts/subscription/types";
import { Subscription } from "../subscription/model";
import { TSubscription } from "./types";

class Computed<T> extends Subscription<Computed<T>> {
	readonly #unsubscribes: TValueUnsubscribe[];
	readonly #compute: () => T
	readonly #dependencies: TSubscription[]
	#changed = true;
	#value?: T
	#prevValue?: T

	constructor(
		compute: () => T,
		dependencies: TSubscription[]
	) {
		super()
		this.#compute = compute
		this.#dependencies = dependencies
		this.#unsubscribes = dependencies.map(dep => dep.subscribe(() => {
			this.#changed = true
			this.notifies(this)
		}));
	}

	#tryUpdate() {
		if (!this.#changed) return;
		this.#changed = false;
		this.#prevValue = this.#value;
		this.#value = this.#compute();
	}

	get prevValue() {
		this.#tryUpdate()
		return this.#prevValue
	}

	get value() {
		this.#tryUpdate()
		return this.#value!
	}

	dispose(): void {
		this.#unsubscribes.forEach(unsubscribe => unsubscribe());
		super.dispose();
	}
}

function computed<T>(compute: () => T, dependencies: TSubscription[]) {
	return new Computed(compute, dependencies)
}

export {
	Computed,
	computed,
}