import { TONE_STOPS } from "./declarations";

/** The conventional tone stops. */
type TToneStops = typeof TONE_STOPS
/** One conventional tone stop. */
type TToneStop = TToneStops[number]

/** Recipe for `Palette.derive` — a new palette whose seed is this palette's mid tone, adjusted. */
type TPaletteDerive = {
	/** Degrees added to the hue (wraps at 360). */
	hueShift?: number;
	/** Multiplies the chroma. */
	chromaScale?: number;
	/** Replaces the chroma (applied after `chromaScale`). Use a small value (~0.03) for neutrals. */
	chroma?: number;
	/** Defaults to this palette's name. */
	name?: string;
};

export {
	TToneStops,
	TToneStop,
	TPaletteDerive,
}
