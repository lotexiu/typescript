import { SlotValue } from "../slot-value/model";


class ThemeStyle<
	const N extends string = string,
	const S extends SlotValue[] = SlotValue[],
	const C extends Record<string, any> = Record<string, any>
> {
	constructor(
		readonly name: N,
		readonly slotColors: S,
		readonly components: C
	){

	}
}

export {
	ThemeStyle
}