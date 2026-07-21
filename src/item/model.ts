import { Computed } from "../computed/model";
import { Subscription } from "../subscription/model";
import { model, Model } from "../model/model";

class Item<V> extends Subscription<any> {
	value: Model<any>

	constructor(
		readonly id: string,
		readonly label: Computed<string>,
		value: V
	){
		super()
		this.value = model(value)
	}
}

export {
	Item
}