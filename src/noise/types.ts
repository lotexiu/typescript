/** Layers of a fractal noise: each octave adds finer detail with less weight. */
type TFractalOptions = {
	/** Number of layers. Default 4. */
	readonly octaves?: number;
	/** Frequency multiplier per layer. Default 2. */
	readonly lacunarity?: number;
	/** Weight multiplier per layer. Default 0.5. */
	readonly gain?: number;
};

export type { TFractalOptions };
