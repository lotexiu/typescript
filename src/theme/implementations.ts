import Color from "colorjs.io";
import {
	TColorResult,
	TMainColors,
	TOppositeColorOptions,
	TTheme,
	TThemeBuilder,
	TThemeVariationsBuilder,
} from "./types";
import { TObject } from "@tsn-object/generic/types";
import { _Object } from "@tsn-object/generic/implementations";
import { includes, isNull } from "@ts/implementations";
import { TNullable } from "@ts/types";
import { TThemeFontBuilder } from "dist";

/**
 * Finds the opposite color based on LCH values (perceptually uniform).
 * @param color The original color to find the opposite of.
 * @param options Options to adjust the opposite color's LCH values.
 * @returns The opposite color.
 */
function oppositeColor(
	color: Color,
	options: TOppositeColorOptions = {
		h: 'full',
		l: 'full',
		s: 'full', // s será tratado como chroma (c) no LCH
	},
) {
	// Usa LCH para manipulação perceptualmente uniforme
	const lchColor = color.to("lch").clone();
	let { l, c, h } = lchColor.lch;

	const settingValues = {
		weak: { h: 60, l: 33, c: 33 },
		medium: { h: 120, l: 66, c: 66 },
		full: { h: 180, l: 100, c: 100 },
	};

	// Mapeia 's' para 'c' (chroma) no LCH
	const mappedOptions = {
		h: options.h,
		l: options.l,
		c: options.s, // saturação -> chroma
	};

	let newColor = { h, l, c };

	_Object.entries(newColor).forEach(([key, value]) => {
		const optionKey = key as 'h' | 'l' | 'c';
		const optionValue = mappedOptions[optionKey];

		if (isNull(optionValue)) return;

		// Tratamento especial para cada tipo de opção
		if (includes(['maxRange', 'minRange', 'middleRange'], optionValue)) {
			if (key === 'h') return;
			if (optionValue === 'middleRange') {
				newColor[key] = key === 'l' ? 50 : (key === 'c' ? 50 : value);
			} else {
				const maxValue = key === 'l' ? 100 : (key === 'c' ? 150 : 360);
				newColor[key] = optionValue === 'maxRange' ? maxValue : 0;
			}
			return;
		}

		if (includes(['fullRange'], optionValue)) {
			if (key === 'h') return;
			const threshold = key === 'l' ? 50 : (key === 'c' ? 75 : 180);
			const maxValue = key === 'l' ? 100 : (key === 'c' ? 150 : 360);
			newColor[key] = value < threshold ? maxValue : 0;
			return;
		}

		if (typeof optionValue === 'number') {
			if (key === 'h') {
				newColor[key] = optionValue * 360;
			} else if (key === 'l') {
				newColor[key] = optionValue * 100;
			} else if (key === 'c') {
				newColor[key] = optionValue * 150; // chroma max ~150
			}
			return;
		}

		// Aplicação dos valores predefinidos (weak, medium, full)
		const settingValue = settingValues[optionValue as 'weak' | 'medium' | 'full']?.[key];
		if (settingValue !== undefined) {
			if (key === 'h') {
				newColor[key] = (value + settingValue) % 360;
			} else if (key === 'l') {
				newColor[key] = Math.abs(value - settingValue);
			} else if (key === 'c') {
				// Para chroma, ajusta proporcionalmente
				newColor[key] = Math.abs(value - (settingValue * 1.5));
			}
		}
	});

	// Aplica os novos valores no espaço LCH e converte de volta
	lchColor.lch.l = newColor.l;
	lchColor.lch.c = newColor.c;
	lchColor.lch.h = newColor.h;

	return lchColor.to(color.space.id);
}

function lightColor(color: Color): boolean {
	return color.to("lch").l > 50;
}

function hasContrast(background: Color, foreground: Color, wcagRequirement: number = 4.5): boolean {
	return background.contrast(foreground, "WCAG21") >= wcagRequirement;
}

function toContrast(background: Color, foreground: Color, wcagRequirement: number = 4.5): TColorResult {
	const fg = foreground.clone().to("lch");
	const bg = background.clone().to("lch");

	if (hasContrast(bg, fg, wcagRequirement)) {
		return {
			color: fg,
			contrast: background.contrast(fg, "WCAG21"),
			adjusted: false,
			iterations: 0,
		}
	}

	const isBgLight = lightColor(bg);

	let luminanceRange = [0, 100];

	let bestResult = {
		color: fg.clone(),
		contrast: background.contrast(fg, "WCAG21"),
	};

	let iterations = 0;
	const maxIterations = 50;

	while (iterations < maxIterations && Math.abs(bestResult.contrast - wcagRequirement) > 0.1) {
		const averageLuminance = (luminanceRange[0] + luminanceRange[1]) / 2;
		/* Test Color */
		const testColor = fg.clone();
		testColor.l = averageLuminance;

		const contrastResult = background.contrast(testColor, "WCAG21");

		/* Update if its better */
		if (Math.abs(contrastResult - wcagRequirement) < Math.abs(bestResult.contrast - wcagRequirement)) {
			bestResult.contrast = contrastResult;
			bestResult.color = testColor;
		}

		/* Update Range */
		let contrastDirection = contrastResult < wcagRequirement ? 0 : 1;
		if (!isBgLight) {
			luminanceRange[contrastDirection] = averageLuminance;
		} else {
			luminanceRange[1 - contrastDirection] = averageLuminance;
		}

		iterations++;
	}

	const colorResult = {
		color: bestResult.color,
		contrast: bestResult.contrast,
		adjusted: true,
		iterations
	};

	return colorResult
}

/**
 * Creates a theme schema with the specified main colors and rules.
 * @param mainColors - The main colors to include in the theme.
 * @param variations - The rules to apply to the theme.
 * @returns A function that takes the main colors and returns the themed colors.
 */
export function themeSchema<
	const K extends string[],
	T1 extends TThemeVariationsBuilder<K>,
	T2 extends TThemeFontBuilder<K | [keyof T1]>,
>(
	mainColors: K,
	backgroundKey: K[number],
	variations: T1,
	fontVariations: T2,
	validator?: (theme: TTheme<K, T1, T2>, wcagRequirement?: number) => void,
): TThemeBuilder<K, T1> {
	return (colors: TMainColors<any>, wcagRequirement?: number, validate?: boolean, logs: boolean = false): TTheme<K, T1, T2> => {
		validateMainColors<K>(mainColors, colors);
		const theme: TTheme = mapMainColorsToTheme(colors);
		const darkTheme = theme[backgroundKey].lch.l < 50;
		processThemeDefinitions<T1, T2>(
			variations,
			theme,
			darkTheme,
			fontVariations,
			wcagRequirement,
			logs,
		);
		initializeThemeProperties<K, T1, T2>(
			theme,
			backgroundKey,
			mainColors,
			variations,
			fontVariations,
		);
		if (validate) {
			checkVariationContrast(theme);
			validator?.(theme as any, wcagRequirement);
		}
		return theme as any;
	};
}

function validateMainColors<const K extends string[]>(
	mainColors: K,
	colors: TMainColors<any>,
) {
	const colorsNotFounded = mainColors.filter((key) => !(key in colors));
	if (colorsNotFounded.length > 0) {
		throw new Error(`Missing main colors: ${colorsNotFounded.join(", ")}`);
	}
}

function mapMainColorsToTheme(colors: TMainColors<any>): TTheme {
	const theme: TTheme = {} as TTheme;
	Object.entries(colors).forEach(([key, value]) => {
		theme[key] = new Color(value).to("lch");
	});
	return theme;
}

function processThemeDefinitions<
	T1 extends TThemeVariationsBuilder<any>,
	T2 extends TThemeFontBuilder<any | [keyof T1]>,
>(
	variations: T1,
	theme: Record<string, Color>,
	darkTheme: boolean,
	fontVariations: T2,
	wcagRequirement?: number,
	logs: boolean = false,
) {
	Object.entries(variations).forEach(([key, value]) => {
		if (typeof value === "function") {
			theme[key] = new Color(value(theme, darkTheme)).to("lch");
		} else {
			theme[key] = new Color(value).to("lch");
		}
	});

	Object.entries(fontVariations).forEach(([key, value]) => {
		if (typeof value === "function") {
			const {bg, fg} = value(theme, darkTheme);
			const newForeground = toContrast(bg.to('lch'), fg.to('lch'), wcagRequirement);

			if (logs && newForeground.adjusted) {
				console.warn([
					`[WCAG21][FONT] '${key}' was adjusted to have sufficient contrast against its background.`,
					`Minimal Required: ${wcagRequirement}`,
					`Original FG: ${fg.to('lch').toString()} Contrast: ${fg.to('lch').contrast(bg.to('lch'), 'WCAG21').toFixed(2)}`,
					`New FG: ${newForeground.color.toString()} Contrast: ${newForeground.contrast.toFixed(2)}`,
					`ColorScheme: ${darkTheme ? 'Dark' : 'Light'}`,
				].join('\n'));
			}

			theme[key] = newForeground.color.to("lch");
		} else {
			theme[key] = new Color(value).to("lch");
		}
	});
}

function initializeThemeProperties<
	const K extends string[],
	T1 extends TThemeVariationsBuilder<K>,
	T2 extends TThemeFontBuilder<K | [keyof T1]>,
>(
	theme: TTheme,
	backgroundKey: K[number],
	mainColors: K,
	variations: T1,
	fontVariations: T2,
) {
	theme.getBackground = theme[backgroundKey];
	theme.getMainColors = mainColors;
	theme.getVariations = Object.keys(variations) as [keyof T1];
	theme.getFontVariations = Object.keys(fontVariations) as [keyof T2];
}

function checkVariationContrast<T extends TTheme>(theme: TObject<T>) {
	const minRequired = 3.5
	theme.getVariations.forEach((key) => {
		if (!(key in theme)) {
			throw new Error(`Missing theme variation color: ${key.toString()}`);
		}
		const contrast = theme[key as string].contrast(
			theme.getBackground,
			"Lstar",
		);
		if (contrast < minRequired) {
			console.warn([
				`[WCAG21] Low contrast (${contrast.toFixed(2)}).`,
				`Recommended to be above ${minRequired} between '${key.toString()}' and background.`,
			].join('\n'));
		}
	});
}

let currentTheme: TNullable<TTheme> = null;

function getCurrentTheme() {
	return currentTheme;
}

function applyThemeToDocument<T extends TTheme>(theme: TObject<T>) {
	const root = document.documentElement;
	Object.entries(theme).forEach(([key, value]) => {
		root.style.setProperty(`--${key.toKebabCase()}`, value.toString());
	});
	currentTheme = theme;
}


export const _Theme = {
	themeSchema,
	applyThemeToDocument,
	getCurrentTheme,
	oppositeColor,
	toContrast,
};
