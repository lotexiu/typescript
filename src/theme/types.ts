import { TAsArray } from "@tsn-array/generic/types";
import type { TRecord } from "@tsn-object/generic/types";
import type Color from "colorjs.io";
import type { ColorTypes } from "colorjs.io";

type TMainColors<T = any, R = ColorTypes> = { [key in TAsArray<T>[number]]: R };

type TColorBuilder<K, R> = (
	mainColors: TMainColors<K, Color>,
	darkTheme: boolean,
) => R;

type TThemeVariationsBuilder<K> = {
	[key: string]: TColorBuilder<K, Color> | ColorTypes;
};

type TThemeFontBuilder<K> = {
	[key: string]: TColorBuilder<K, {bg: Color; fg: Color}> | ColorTypes;
};

type TTheme<K = any, T1 = any, T2 = any> = TRecord<K, Color> &
	TRecord<T1, Color> &
	TRecord<T2, Color> & {
		getBackground: Color;
		getMainColors: K;
		getVariations: [keyof T1];
		getFontVariations: [keyof T2];
	};

/**
 * A function that takes the main colors and returns the themed colors.
 * @param mainColors - The main colors to use for the theme.
 * @returns The themed colors.
 */
type TThemeBuilder<K, R = any> = (
	mainColors: TMainColors<K>,
	wcagRequirement?: number,
	validate?: boolean,
	logs?: boolean,
) => TTheme<K, R>;

type IntensityLevel = "weak" | "medium" | "full" | "fullRange" | "middleRange" | number;

type TOppositeColorOptions = {
	h?: IntensityLevel;
	l?: IntensityLevel | "maxRange" | "minRange";
	s?: IntensityLevel | "maxRange" | "minRange";
};

type TColorResult = {
	color: Color;
	contrast: number;
	adjusted: boolean;
	iterations: number;
}

export {
	TMainColors,
	TColorBuilder,
	TThemeVariationsBuilder,
	TThemeFontBuilder,
	TThemeBuilder,
	TTheme,
	TOppositeColorOptions,
	TColorResult,
};
