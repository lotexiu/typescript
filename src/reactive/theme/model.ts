import { model, Model } from "../model/model";
import { SlotValue } from "./slot-value/model";
import { ThemeStyle } from "./style/model";
import { TThemeMode } from "./types";

class Theme {
	mode: TThemeMode = 'dark'
	style?: ThemeStyle
	palettes?: any
}
