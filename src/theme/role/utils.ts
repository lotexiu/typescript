import { LocaleError } from '@ts/locale/error';
import { TColor, TContrastMetric } from '../color/types';
import { ColorUtils } from '../color/utils';
import { Palette } from '../palette/model';
import { ROLE_LOCALES } from './declarations';
import { TRoleCheck, TRoleContext, TRoleOptions, TRoleRule, TRoleRules, TRolesResolved, TRoleSuggestion, TRoleTone } from './types';

/**
 * Turns the roles a style declares into colors. The style decides tones and which role sits on which; this only
 * evaluates them in declaration order and checks the readability of every `on`/`min` pair. Names carry no meaning here.
 *
 * `Palette.get` is reactive, so calling `resolve` inside a `derived` re-runs it when a palette's seed changes.
 */
class RoleUtils {
	static resolve<P extends string, R extends string>(
		rules: TRoleRules<P, R>,
		palettes: Readonly<Record<P, Palette>>,
		options: TRoleOptions
	): TRolesResolved<R> {
		const { mode, contrast = 0, metric = 'WCAG21', enforce = false } = options;
		const colors = {} as Record<R, TColor>;
		const checks: TRoleCheck<R>[] = [];

		for (const role of Object.keys(rules) as R[]) {
			const rule: TRoleRule<P, R> = rules[role];
			const palette = palettes[rule.palette];
			if (!palette) throw new LocaleError(ROLE_LOCALES, 'unknownPalette', { cause: { role, palette: rule.palette } });

			const tone = RoleUtils.#tone(rule.tone, { mode, contrast });
			let color = palette.get(tone);

			if (rule.on !== undefined) {
				if (!Object.hasOwn(colors, rule.on)) throw new LocaleError(ROLE_LOCALES, 'unresolvedBackground', { cause: { role, on: rule.on } });
				if (rule.min !== undefined) {
					const background = colors[rule.on];
					const ratio = ColorUtils.contrast(color, background, metric);
					const passed = ratio >= rule.min;
					const suggestion = passed ? undefined : RoleUtils.#suggest(palette, tone, background, rule.min, metric, ratio);
					checks.push({ role, on: rule.on, ratio, min: rule.min, passed, ...(suggestion && { suggestion }) });
					if (enforce && suggestion) color = suggestion.color;
				}
			}
			colors[role] = color;
		}
		return { colors, checks };
	}

	static #tone(tone: TRoleTone, context: TRoleContext): number {
		const value = typeof tone === 'function' ? tone(context) : typeof tone === 'number' ? tone : tone[context.mode];
		return Math.min(100, Math.max(0, value));
	}

	/** Walks outward from `tone` (one step at a time, both ways) and stops at the first tone that reaches `min`. */
	static #suggest(palette: Palette, tone: number, background: TColor, min: number, metric: TContrastMetric, current: number): TRoleSuggestion | undefined {
		let best: TRoleSuggestion | undefined;
		for (let distance = 1; distance <= 100; distance++) {
			for (const candidate of [tone - distance, tone + distance]) {
				if (candidate < 0 || candidate > 100) continue;
				const color = palette.get(candidate);
				const ratio = ColorUtils.contrast(color, background, metric);
				if (ratio >= min) return { tone: candidate, color, ratio };
				if (ratio > (best?.ratio ?? current)) best = { tone: candidate, color, ratio };
			}
		}
		return best;
	}
}

export { RoleUtils };
