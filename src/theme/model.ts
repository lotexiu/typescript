import { Computed, computed } from '@tsr-node/computed/model';
import { Signal, signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';
import { TValueUnsubscribe } from '@ts/subscription/types';
import { LocaleError } from '@ts/locale/error';
import { TColor } from './color/types';
import { THEME_LOCALES } from './declarations';
import { Palette } from './palette/model';
import { TRoleCheck, TRoleNames, TRoleRules } from './role/types';
import { RoleUtils } from './role/utils';
import { ThemeStyle } from './style/model';
import { TThemeMode } from './types';

/** Palette id → palette. Ids left out (or `undefined`) fall back to the style's default palette. */
type TPaletteAssignment<S extends ThemeStyle = ThemeStyle> = Readonly<Partial<Record<keyof S['palettes'] & string, Palette>>>;

/**
 * A style + the palettes assigned to its ids + the user's settings (`mode`, `contrast`, `enforce`), resolved into
 * colors. Everything is a signal, so a UI or an adapter only reads `roles()`/`components()` and re-runs on change.
 * How those reach a component (CSS variables, props, bindings) is up to the app.
 *
 * Which palette an id uses: the one assigned (`palettes`/`setPalettes`), else the style's default for that id.
 */
class Theme<S extends ThemeStyle = ThemeStyle> {
	readonly mode: Signal<TThemeMode>;
	/** Contrast level `-1..1` (`0` = default) handed to the style's tone functions. */
	readonly contrast: Signal<number>;
	/** Apply the contrast suggestions (see `checks`) instead of keeping the tones exactly as the style wrote them. */
	readonly enforce: Signal<boolean>;
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
	readonly components: Computed<S['components']>;

	constructor({ style, palettes = {} as TPaletteAssignment<S>, mode = 'dark', contrast = 0, enforce = true }: { style: S; palettes?: TPaletteAssignment<S>; mode?: TThemeMode; contrast?: number; enforce?: boolean }) {
		this.mode = signal(mode);
		this.contrast = signal(contrast);
		this.enforce = signal(enforce);
		this.style = signal(style);
		this.palettes = signal(palettes);
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
export type { TPaletteAssignment };
