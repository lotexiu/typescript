/** The 13 lightness stops `buildTonalPalette` generates (the same set popularized by Material 3). */
type TToneStop = 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 95 | 99 | 100;

/** A full tonal ramp — one hex color per `TToneStop`, keyed as `tone0`..`tone100`. */
type TTonalPalette = {
	[K in `tone${TToneStop}`]: string;
};

/** Input to `buildTonalPalette`. */
type TTonalPaletteSeeds = {
	/** Qualquer cor aceita pelo colorjs.io (hex, nome, `rgb()`, etc.). */
	seed: string;
};

export type {
	TToneStop,
	TTonalPalette,
	TTonalPaletteSeeds,
}
