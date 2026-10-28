import { TThemeMode } from "../types";
import { Palette } from "../palette/model";
import { ACCENT_SCHEME, NEUTRAL_SCHEME, NEUTRAL_SLOT } from "./declarations";
import { TRoleScheme, TRoles } from "./types";

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

	/**
	 * Picks concrete colors out of every slot palette for `mode`.
	 *
	 * A slot named `neutral` yields `background`, `surface1..3`, `onSurface`, `muted`, `outline`, `outlineSoft`;
	 * any other slot yields `main`/`onMain`, `container`/`onContainer`, `bright`. `schemes` adds or replaces
	 * roles per slot (merged over the defaults), e.g. `{ neutral: { ink: { dark: 100, light: 0 } } }`.
	 */
	resolve(mode: TThemeMode, schemes: { readonly [K in keyof S]?: TRoleScheme } = {}): { [K in keyof S]: TRoles } {
		const resolved = {} as { [K in keyof S]: TRoles };
		for (const slot of Object.keys(this.slotColors) as (keyof S & string)[]) {
			const base: TRoleScheme = slot === NEUTRAL_SLOT ? NEUTRAL_SCHEME : ACCENT_SCHEME;
			resolved[slot] = ThemeStyle.#pick(this.slotColors[slot], { ...base, ...schemes[slot] }, mode);
		}
		return resolved;
	}

	static #pick(palette: Palette, scheme: TRoleScheme, mode: TThemeMode): TRoles {
		const roles: TRoles = {};
		for (const [role, spec] of Object.entries(scheme)) {
			const color = palette.get(spec[mode]);
			roles[role] = color;
			if (spec.readable) roles[`on${role[0].toUpperCase()}${role.slice(1)}`] = palette.onColor(color);
		}
		return roles;
	}
}

export {
	ThemeStyle
}
