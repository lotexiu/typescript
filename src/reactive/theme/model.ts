import { Model, model } from "../model/model";
import { Palette, TonalPalette } from "./palette/model";
import { SlotValue } from "./slot-value/model";
import { ThemeStyle } from "./style/model";
import { TThemeMode } from "./types";

class Theme {
	mode: Model<TThemeMode> = model<TThemeMode>('dark')
	style: Model<ThemeStyle>
	private palettes: Model<(TonalPalette|Palette)[]>

	constructor(
		initialStyle: ThemeStyle,
		palettes: (TonalPalette|Palette)[]
	) {
		this.style = model(initialStyle)
		this.palettes = model(palettes)
	}
}

const neonStyle =  new ThemeStyle('neon', [
	new SlotValue('primary', 'orange'),
	new SlotValue('secondary', 'purple')
], {
	input: 1,
	button: 1,
	select: 1,
	checkbox: 1,
})

const theme = new Theme(neonStyle, [])