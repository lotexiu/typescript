import { Computed } from "@ts/computed/model";
import { Model } from "@ts/model/model";
import Color from "colorjs.io";

type SlotColor = {
	readonly id: string,
	readonly value: Model<Color>|Computed<Color>
}

export {
	SlotColor
}