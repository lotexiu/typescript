import { _Theme } from "./implementations";

class ThemeUtils {
	static themeSchema = _Theme.themeSchema;
	static applyThemeToDocument = _Theme.applyThemeToDocument;
	static getCurrentTheme = _Theme.getCurrentTheme;
	static oppositeColor = _Theme.oppositeColor;
	static toContrast = _Theme.toContrast;
}

export { ThemeUtils };
