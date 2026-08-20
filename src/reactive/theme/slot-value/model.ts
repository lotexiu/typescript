import { Model, model } from "@ts/reactive/model/model";

class SlotValue<
	const K extends string = string,
	V = any
> {
	value: Model<V>
	constructor(
		public readonly key: K,
		initalValue: V,
		public label: string = '',
	){
		this.value = model(initalValue)
	}
}

export {
	SlotValue
}