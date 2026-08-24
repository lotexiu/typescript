import { TValueUnsubscribe } from "@ts/subscription/types";
import { Subscription } from "../subscription/model";
import { TSubscription } from "./types";

class Computed<T> extends Subscription<Computed<T>> {
	private changed = true;
	private _value?: T
	private _prevValue?: T
	private readonly unsubscribes: TValueUnsubscribe[];

	constructor(
		private readonly compute: () => T,
		private readonly dependencies: TSubscription[]
	) {
		super()
		this.unsubscribes = dependencies.map(dep => dep.subscribe(() => {
			this.changed = true
			this.notifies(this)
		}));
	}

	private tryUpdate() {
		if (!this.changed) return;
		this.changed = false;
		this._prevValue = this._value;
		this._value = this.compute();
	}

	get prevValue() {
		this.tryUpdate()
		return this._prevValue
	}

	get value() {
		this.tryUpdate()
		return this._value!
	}

	dispose(): void {
		this.unsubscribes.forEach(unsubscribe => unsubscribe());
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