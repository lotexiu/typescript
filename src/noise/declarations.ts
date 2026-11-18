/**
 * @internal
 * Size of the permutation table; coordinates repeat after this many cells.
 */
const NOISE_PERIOD = 256;

/**
 * @internal
 */
const FRACTAL_DEFAULTS = {
	OCTAVES: 4,
	LACUNARITY: 2,
	GAIN: 0.5,
} as const;

export { NOISE_PERIOD, FRACTAL_DEFAULTS };
