import { Item } from "@ts/reactive/item/model";
import { Palette } from "../palette/model";

class ThemeStyle<
	const N extends string = string,
	const S extends Record<string, Palette> = Record<string, Palette>,
	const C extends Record<string, any> = Record<string, any>
> {
	constructor(
		readonly name: N,
		readonly slotColors: S,
		readonly components: C,
	){}
}

export {
	ThemeStyle
}