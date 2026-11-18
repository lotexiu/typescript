import { TColor, TContrastMetric } from '../color/types';
import { TThemeMode } from '../types';

/** What a role's tone can depend on. `contrast` is a user-facing level (`-1..1`, `0` = default) for tone functions to honor. */
type TRoleContext = {
	/** Current mode. */
	readonly mode: TThemeMode;
	/** Current contrast setting, from -1 to 1. */
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
/** Palette ids the rules use. */
type TRolePalettes<Rules extends TRoleRules> = Rules[keyof Rules]['palette'];

/** Inputs of `RoleUtils.resolve` besides rules and palettes. */
type TRoleOptions = {
	/** Mode to resolve for. */
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
	/** Tone that would pass (or the most readable one). */
	readonly tone: number;
	/** Color at that tone. */
	readonly color: TColor;
	/** Contrast at that tone, in the metric's unit. */
	readonly ratio: number;
};

/** The result of one role's `on`/`min` check, measured on the color as authored. */
type TRoleCheck<R extends string = string> = {
	/** The role being checked (the foreground). */
	readonly role: R;
	/** The role it sits on (the background). */
	readonly on: R;
	/** Measured contrast. */
	readonly ratio: number;
	/** Required contrast. */
	readonly min: number;
	/** Whether `ratio` reaches `min`. */
	readonly passed: boolean;
	/** Only when it did not pass and a more readable tone exists. */
	readonly suggestion?: TRoleSuggestion;
};

/** Result of resolving roles. */
type TRolesResolved<R extends string = string> = {
	/** Color of each role (with suggestions applied when enforcing). */
	readonly colors: Record<R, TColor>;
	/** One check per role with an `on`/`min` pair. */
	readonly checks: TRoleCheck<R>[];
};

export type { TRoleContext, TRoleTone, TRoleRule, TRoleRules, TRoleNames, TRolePalettes, TRoleOptions, TRoleSuggestion, TRoleCheck, TRolesResolved };
