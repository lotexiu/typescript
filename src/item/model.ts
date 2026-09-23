import { Computed } from "../computed/model";
import { Subscription } from "../subscription/model";
import { model, Model } from "../model/model";

class Item<V> {
	readonly value: Model<V>

	constructor(
		readonly id: string,
		readonly label: Computed<string>,
		initial: V
	){
		this.value = model(initial)
	}
}

export {
	Item
}