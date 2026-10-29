import { TColor, TContrastMetric } from '../color/types';
import { TThemeMode } from '../types';

/** What a role's tone can depend on. `contrast` is a user-facing level (`-1..1`, `0` = default) for tone functions to honor. */
type TRoleContext = {
	readonly mode: TThemeMode;
	readonly contrast: number;
};

/** The tone (`0..100`) a role takes: one for every mode, one per mode, or computed from the context. */
type TRoleTone = number | Readonly<Record<TThemeMode, number>> | ((context: TRoleContext) => number);

/**
 * One role of a style: which palette it comes from, which tone, and — optionally — which other role it sits
 * on (`on`) and how readable it must be there (`min`, in the units of the metric used to resolve).
 * Names (`P` for palettes, `R` for roles) are whatever the style's author chose; the lib gives none a meaning.
 */
type TRoleRule<P extends string = string, R extends string = string> = {
	readonly palette: P;
	readonly tone: TRoleTone;
} & (
	| { readonly on?: undefined; readonly min?: undefined }
	| { readonly on: R; readonly min?: number }
);

/** Role name → rule. Resolved in declaration order, so `on` must name a role declared before it. */
type TRoleRules<P extends string = string, R extends string = string> = {
	readonly [K in R]: TRoleRule<P, R>;
};

/** The role names a rule map declares, and the palette names those rules need. */
type TRoleNames<Rules extends TRoleRules> = keyof Rules & string;
type TRolePalettes<Rules extends TRoleRules> = Rules[keyof Rules]['palette'];

type TRoleOptions = {
	readonly mode: TThemeMode;
	/** Default `0`. */
	readonly contrast?: number;
	/** Default `WCAG21`. */
	readonly metric?: TContrastMetric;
	/** Apply the suggestions instead of only reporting them. Default `false`. */
	readonly enforce?: boolean;
};

/** The nearest tone that satisfies `min`; if none does, the most readable one the palette has. */
type TRoleSuggestion = {
	readonly tone: number;
	readonly color: TColor;
	readonly ratio: number;
};

/** The result of one role's `on`/`min` check, measured on the color as authored. */
type TRoleCheck<R extends string = string> = {
	readonly role: R;
	readonly on: R;
	readonly ratio: number;
	readonly min: number;
	readonly passed: boolean;
	/** Only when it did not pass and a more readable tone exists. */
	readonly suggestion?: TRoleSuggestion;
};

type TRolesResolved<R extends string = string> = {
	readonly colors: Record<R, TColor>;
	readonly checks: TRoleCheck<R>[];
};

export type { TRoleContext, TRoleTone, TRoleRule, TRoleRules, TRoleNames, TRolePalettes, TRoleOptions, TRoleSuggestion, TRoleCheck, TRolesResolved };
