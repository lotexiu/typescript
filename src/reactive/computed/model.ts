import { Model } from "../model/model";
import { TValueListener, TValueUnsubscribe } from "../model/types";
import { TSubscription } from "./types";

class Computed<T> {
	private _value: Model<T>

	get value() {return this._value.value}

	constructor(
		private readonly compute: () => T,
		private readonly dependencies: TSubscription[]
	) {
		this._value = new Model(compute());
		dependencies.forEach(dep => dep.subscribe(() => {
			this._value.set(compute())
		}));
	}

	subscribe(listener: TValueListener<T>): TValueUnsubscribe {
		return this._value.subscribe(listener);
	}
}

function computed<T>(compute: () => T, dependencies: TSubscription[]) {
	return new Computed(compute, dependencies)
}

export {
	Computed,
	computed,
}