import { LocaleError } from "@ts/locale/error";
import { TContrastMetric } from "../color/types";
import { Palette } from "../palette/model";
import { TRoleRules } from "../role/types";
import { STYLE_LOCALES } from "./declarations";

/** Palette id → the palette the style uses when nobody assigns another one. */
type TPaletteDefaults = Readonly<Record<string, Palette>>;

/**
 * Everything one visual style decides, and nothing that changes at runtime. The style owns:
 *  - `palettes`: the palette ids it needs (two, three, four… — its call) and, for each, a **default** palette.
 *    Defaults are mandatory: they are what a `Theme` falls back to for an id nobody assigned, so switching to a
 *    style that needs more palettes than the previous one never leaves a role without a color;
 *  - `roles`: which palette id, which tone per mode, what each sits on and how readable it must be;
 *  - `components` (radii, fonts…) and the contrast `metric` its `min` values are written in.
 * The ids mean nothing to the lib; roles may only cite ids declared in `palettes`.
 */
class ThemeStyle<
	const N extends string = string,
	const P extends TPaletteDefaults = TPaletteDefaults,
	const R extends TRoleRules = TRoleRules,
	const C extends Record<string, any> = Record<string, any>
> {
	readonly name: N;
	readonly palettes: P;
	readonly roles: R;
	readonly components: C;
	readonly metric: TContrastMetric;

	constructor({ name, palettes, roles, components = {} as C, metric = 'WCAG21' }: { name: N; palettes: P; roles: R & TRoleRules<keyof P & string>; components?: C; metric?: TContrastMetric }) {
		for (const role of Object.keys(roles)) {
			const palette = roles[role].palette;
			if (!Object.hasOwn(palettes, palette)) throw new LocaleError(STYLE_LOCALES, 'undeclaredPalette', { cause: { role, palette, declared: Object.keys(palettes) } });
		}
		this.name = name;
		this.palettes = palettes;
		this.roles = roles;
		this.components = components;
		this.metric = metric;
	}
}

export {
	ThemeStyle
}
export type { TPaletteDefaults }
