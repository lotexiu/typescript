import { LocaleError } from "@ts/locale/error";
import { TAdjustmentDefinitions } from "../adjustment/types";
import { AdjustmentUtils } from "../adjustment/utils";
import { TContrastMetric } from "../color/types";
import { Palette } from "../palette/model";
import { TRoleRules } from "../role/types";
import { STYLE_LOCALES } from "./declarations";
import { TStyleTokens } from "./types";

/** Palette id → the palette the style uses when nobody assigns another one. */
type TPaletteDefaults = Readonly<Record<string, Palette>>;

/**
 * Everything one visual style decides, and nothing that changes at runtime. The style owns:
 *  - `palettes`: the palette ids it needs (two, three, four… — its call) and, for each, a **default** palette.
 *    Defaults are mandatory: they are what a `Theme` falls back to for an id nobody assigned, so switching to a
 *    style that needs more palettes than the previous one never leaves a role without a color;
 *  - `roles`: which palette id, which tone per mode, what each sits on and how readable it must be;
 *  - `components` and the contrast `metric` its `min` values are written in.
 * The ids mean nothing to the lib; roles may only cite ids declared in `palettes`.
 */
class ThemeStyle<
	const C extends Record<string, any> = Record<string, any>,
	const N extends string = string,
	const P extends TPaletteDefaults = TPaletteDefaults,
	const R extends TRoleRules = TRoleRules,
	const A extends TAdjustmentDefinitions = TAdjustmentDefinitions,
	T extends Record<string, unknown> = Record<string, unknown>
> {
	/** Name of the style. */
	readonly name: N;
	/** Palette ids with their default palettes. */
	readonly palettes: P;
	/** Role rules. */
	readonly roles: R;
	/** Whatever the app attaches to the style (components, render functions, class names). */
	readonly components: C;
	/** Settings the style offers to the user, as control definitions. */
	readonly adjustments: A;
	/** Computes the style's design tokens from mode, contrast, palettes, role colors and adjustment values. */
	readonly tokens: TStyleTokens<keyof P & string, keyof R & string, A, T>;
	/** Contrast metric the roles' `min` values are written in. */
	readonly metric: TContrastMetric;

	constructor({
		name,
		palettes,
		roles,
		components = {} as C,
		adjustments = {} as A,
		tokens = (() => ({})) as unknown as TStyleTokens<keyof P & string, keyof R & string, A, T>,
		metric = 'WCAG21',
	}: {
		name: N;
		palettes: P;
		roles: R & TRoleRules<keyof P & string>;
		components?: C;
		adjustments?: A;
		tokens?: TStyleTokens<keyof P & string, keyof R & string, A, T>;
		metric?: TContrastMetric;
	}) {
		for (const role of Object.keys(roles)) {
			const palette = roles[role].palette;
			if (!Object.hasOwn(palettes, palette)) throw new LocaleError(STYLE_LOCALES, 'undeclaredPalette', { cause: { role, palette, declared: Object.keys(palettes) } });
		}
		AdjustmentUtils.validate(adjustments);
		this.name = name;
		this.palettes = palettes;
		this.roles = roles;
		this.components = components;
		this.adjustments = adjustments;
		this.tokens = tokens;
		this.metric = metric;
	}
}

export {
	ThemeStyle
}
export type { TPaletteDefaults }
