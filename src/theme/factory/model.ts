import { LocaleError } from "@ts/locale/error";
import { Palette, TonalPalette } from "../palette/model";
import { FACTORY_LOCALES } from "./declarations";
import { TPaletteRules, TPaletteSeed, TSeed, TSeedDefinitions } from "./types";

/**
 * Makes the palettes of a theme from a few colors. It declares two things:
 *  - `seeds`: the inputs a user can edit (one color, two colors…), each with a label a UI can show and a default;
 *  - `palettes`: for each palette id, a rule that produces it from the seeds (`brand.derive(...)`, `brand.neutral()`…).
 *
 * `build` runs the rules and returns `{ paletteId: Palette }` — what `Theme.setPalettes`/`bindPalettes` take, and,
 * with the default seeds, what a `ThemeStyle` can use as its mandatory default palettes. Any generated palette can be
 * replaced by hand (`overrides`). It is a plain function of its arguments, not reactive: call it inside a `computed`.
 *
 * Swap the factory and the UI adapts, because it reads `seeds` instead of assuming how many colors there are.
 */
class PaletteFactory<
	const D extends TSeedDefinitions = TSeedDefinitions,
	const R extends TPaletteRules<keyof D & string> = TPaletteRules
> {
	/** The inputs, normalized: every seed has a label and a default `Palette`. */
	readonly seeds: Readonly<Record<keyof D & string, TSeed>>;
	readonly #rules: R;

	constructor({ seeds, palettes }: { seeds: D; palettes: R }) {
		this.seeds = Object.fromEntries(
			Object.entries(seeds).map(([id, definition]) => [id, { label: definition.label ?? id, default: PaletteFactory.#toPalette(definition.default, id) }])
		) as Record<keyof D & string, TSeed>;
		this.#rules = palettes;
	}

	/**
	 * Runs every rule. `values` replaces seeds (a color or a `Palette`); the ones left out use their default.
	 * `overrides` puts a hand-picked palette in place of a generated one.
	 */
	build(values: Partial<Record<keyof D & string, TPaletteSeed>> = {}, overrides: Partial<Record<keyof R & string, Palette>> = {}): Record<keyof R & string, Palette> {
		const declaredSeeds = Object.keys(this.seeds);
		for (const id of Object.keys(values)) {
			if (!declaredSeeds.includes(id)) throw new LocaleError(FACTORY_LOCALES, 'unknownSeed', { cause: { id, declared: declaredSeeds } });
		}
		const producedIds = Object.keys(this.#rules);
		for (const id of Object.keys(overrides)) {
			if (!producedIds.includes(id)) throw new LocaleError(FACTORY_LOCALES, 'unknownPalette', { cause: { id, produced: producedIds } });
		}

		const given: Readonly<Record<string, TPaletteSeed | undefined>> = values;
		const seeds = Object.fromEntries(
			declaredSeeds.map((id) => [id, given[id] === undefined ? this.seeds[id as keyof D & string].default : PaletteFactory.#toPalette(given[id], id)])
		) as Record<keyof D & string, Palette>;

		const manual: Readonly<Record<string, Palette | undefined>> = overrides;
		return Object.fromEntries(producedIds.map((id) => [id, manual[id] ?? (this.#rules as TPaletteRules)[id]({ seeds })])) as Record<keyof R & string, Palette>;
	}

	static #toPalette(seed: TPaletteSeed | undefined, id: string): Palette {
		return seed instanceof Palette ? seed : new TonalPalette(seed as string, id);
	}
}

export {
	PaletteFactory
}
