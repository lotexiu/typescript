import { Computed } from "@ts/reactive/computed/model";
import { Model } from "@ts/reactive/model/model";
import Color from "colorjs.io";

type SlotColor = {
	readonly id: string,
	readonly value: Model<Color>|Computed<Color>
}

export {
	SlotColor
}