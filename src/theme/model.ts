import { Computed, computed } from '@tsr-node/computed/model';
import { Signal, signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';
import { TValueUnsubscribe } from '@ts/subscription/types';
import { LocaleError } from '@ts/locale/error';
import { TColor } from './color/types';
import { THEME_LOCALES } from './declarations';
import { TAdjustmentAssignment, TAdjustmentValues } from './adjustment/types';
import { AdjustmentUtils } from './adjustment/utils';
import { DefinitionUtils } from '@ts/headless/definition/utils';
import { Palette } from './palette/model';
import { TRoleCheck, TRoleNames, TRoleRules } from './role/types';
import { RoleUtils } from './role/utils';
import { ThemeStyle } from './style/model';
import { TThemeMode } from './types';

/** Palette id → palette. Ids left out (or `undefined`) fall back to the style's default palette. */
type TPaletteAssignment<S extends ThemeStyle = ThemeStyle> = Readonly<Partial<Record<keyof S['palettes'] & string, Palette>>>;

/** Adjustment values assigned to a theme (only some ids; the rest use the style defaults). */
type TThemeAdjustments<S extends ThemeStyle = ThemeStyle> = TAdjustmentAssignment<S['adjustments']>;

/** What the style's `tokens` function returns. */
type TThemeTokens<S extends ThemeStyle = ThemeStyle> = ReturnType<S['tokens']>;

/**
 * A style + the palettes assigned to its ids + the user's settings (`mode`, `contrast`, `enforce`), resolved into
 * colors. Everything is a signal, so a UI or an adapter only reads `roles()`/`components()` and re-runs on change.
 * How those reach a component (CSS variables, props, bindings) is up to the app.
 *
 * Which palette an id uses: the one assigned (`palettes`/`setPalettes`), else the style's default for that id.
 */
class Theme<S extends ThemeStyle = ThemeStyle> {
	/** `light` or `dark`. */
	readonly mode: Signal<TThemeMode>;
	/** Contrast level `-1..1` (`0` = default) handed to the style's tone functions. */
	readonly contrast: Signal<number>;
	/** Apply the contrast suggestions (see `checks`) instead of keeping the tones exactly as the style wrote them. */
	readonly enforce: Signal<boolean>;
	/**
	 * The style in use. Switching it keeps the assigned palettes and adjustments of the ids the new style also declares.
	 */
	readonly style: Signal<S>;
	/** Only what was assigned. Prefer `setPalettes` to change it; `activePalettes` has what is actually in use. */
	readonly palettes: Signal<TPaletteAssignment<S>>;

	/** Palette in use for each id the current style declares: the assigned one, else the style's default. */
	readonly activePalettes: Computed<Record<keyof S['palettes'] & string, Palette>>;
	/** The style resolved for the current mode, palettes and settings — recomputed whenever any of them changes. */
	readonly resolved: Computed<{ colors: Record<TRoleNames<S['roles']>, TColor>; checks: TRoleCheck<TRoleNames<S['roles']>>[] }>;
	/** Color of every role the style declares. */
	readonly roles: Computed<Record<TRoleNames<S['roles']>, TColor>>;
	/** One entry per role that has an `on`/`min` pair: how it measured and, when it failed, the tone that would pass. */
	readonly checks: Computed<TRoleCheck<TRoleNames<S['roles']>>[]>;
	/** The style's components (whatever the app put there: render functions, class names...). */
	readonly components: Computed<S['components']>;
	/** Adjustment values assigned by the user. Use `setAdjustments` to change them with validation. */
	readonly adjustments: Signal<TThemeAdjustments<S>>;
	/** Every adjustment of the current style: the assigned value when valid, otherwise the default. */
	readonly activeAdjustments: Computed<TAdjustmentValues<S['adjustments']>>;
	/** The style's tokens computed from mode, contrast, palettes, role colors and adjustments. */
	readonly tokens: Computed<TThemeTokens<S>>;

	constructor({
		style,
		palettes = {} as TPaletteAssignment<S>,
		adjustments = {} as TThemeAdjustments<S>,
		mode = 'dark',
		contrast = 0,
		enforce = true,
	}: {
		style: S;
		palettes?: TPaletteAssignment<S>;
		adjustments?: TThemeAdjustments<S>;
		mode?: TThemeMode;
		contrast?: number;
		enforce?: boolean;
	}) {
		AdjustmentUtils.check(style.adjustments, adjustments);
		this.mode = signal(mode);
		this.contrast = signal(contrast);
		this.enforce = signal(enforce);
		this.style = signal(style);
		this.palettes = signal(palettes);
		this.adjustments = signal(adjustments);
		this.activePalettes = computed(() => {
			const defaults: Readonly<Record<string, Palette>> = this.style().palettes;
			const assigned: Readonly<Partial<Record<string, Palette>>> = this.palettes();
			return Object.fromEntries(Object.keys(defaults).map((id) => [id, assigned[id] ?? defaults[id]])) as Record<keyof S['palettes'] & string, Palette>;
		});
		this.resolved = computed(() => {
			const { roles, metric } = this.style();
			return RoleUtils.resolve(roles as TRoleRules<string, TRoleNames<S['roles']>>, this.activePalettes(), {
				mode: this.mode(),
				contrast: this.contrast(),
				enforce: this.enforce(),
				metric,
			});
		});
		this.roles = computed(() => this.resolved().colors);
		this.checks = computed(() => this.resolved().checks);
		this.components = computed(() => this.style().components);
		this.activeAdjustments = computed(() => DefinitionUtils.resolve(this.style().adjustments, this.adjustments()) as TAdjustmentValues<S['adjustments']>);
		this.tokens = computed(
			() =>
				this.style().tokens({
					mode: this.mode(),
					contrast: this.contrast(),
					palettes: this.activePalettes(),
					roles: this.roles(),
					adjustments: this.activeAdjustments(),
				}) as TThemeTokens<S>
		);
	}

	/**
	 * Assigns some adjustments (merged with the current ones). Throws `LocaleError` for an id the style does not declare or a value that does not fit.
	 */
	setAdjustments(assignment: TThemeAdjustments<S>): void {
		AdjustmentUtils.check(this.style().adjustments, assignment);
		this.adjustments.set({ ...Signal.untracked(this.adjustments), ...assignment });
	}

	/**
	 * Keeps the assigned adjustments equal to `source` (now and on every change). Returns the function that stops following it.
	 */
	bindAdjustments(source: TReactive<TThemeAdjustments<S>>): TValueUnsubscribe {
		return Theme.#follow(this.adjustments, source);
	}

	/**
	 * Assigns palettes to ids — one or several at once. Ids not mentioned keep what they had; `undefined` goes back to
	 * the style's default. Only ids the current style declares are accepted; the assignment is kept across style changes.
	 */
	setPalettes(assignment: TPaletteAssignment<S>): void {
		const declared = Object.keys(this.style().palettes);
		for (const id of Object.keys(assignment)) {
			if (!declared.includes(id)) throw new LocaleError(THEME_LOCALES, 'undeclaredPalette', { cause: { id, declared } });
		}
		this.palettes.set({ ...Signal.untracked(this.palettes), ...assignment });
	}

	/** Keeps `style` equal to `source` (applied now and on every change). Returns the function that stops following it. */
	bindStyle(source: TReactive<S>): TValueUnsubscribe {
		return Theme.#follow(this.style, source);
	}

	/** Same as `bindStyle`, for the assigned palettes — e.g. a `computed` over the colors the user picked. */
	bindPalettes(source: TReactive<TPaletteAssignment<S>>): TValueUnsubscribe {
		return Theme.#follow(this.palettes, source);
	}

	static #follow<T>(target: Signal<T>, source: TReactive<T>): TValueUnsubscribe {
		target.set(Signal.untracked(source));
		return source.subscribe((next) => target.set(next));
	}
}

export { Theme };
export type { TPaletteAssignment, TThemeAdjustments, TThemeTokens };
