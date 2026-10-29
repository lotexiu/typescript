import { TColor } from '../color/types';
import { Palette } from '../palette/model';

/** What a seed can be given as: a ready palette, or just a color (turned into a tonal palette). */
type TPaletteSeed = Palette | string | TColor;

/** One input the user can edit. `label` is what a UI shows (defaults to the seed's id). */
type TSeedDefinition = {
	readonly label?: string;
	readonly default: TPaletteSeed;
};

type TSeedDefinitions = Readonly<Record<string, TSeedDefinition>>;

/** The same input after the factory normalized it: always a label and always a `Palette`. */
type TSeed = {
	readonly label: string;
	readonly default: Palette;
};

/** What a palette rule receives: every seed, already as a `Palette`. */
type TPaletteContext<SeedId extends string = string> = {
	readonly seeds: Readonly<Record<SeedId, Palette>>;
};

/** How one palette is produced from the seeds. */
type TPaletteRule<SeedId extends string = string> = (context: TPaletteContext<SeedId>) => Palette;

/** Palette id → rule. The ids are the ones a `ThemeStyle` declares in its `palettes`. */
type TPaletteRules<SeedId extends string = string, PaletteId extends string = string> = {
	readonly [Id in PaletteId]: TPaletteRule<SeedId>;
};

export type { TPaletteSeed, TSeedDefinition, TSeedDefinitions, TSeed, TPaletteContext, TPaletteRule, TPaletteRules };
