import { Random } from '@ts/random/model';
import { FRACTAL_DEFAULTS, NOISE_PERIOD } from './declarations';
import { TFractalOptions } from './types';

/**
 * Smooth 2D value noise from a seed — the same seed always gives the same texture. Values are in `[0, 1]`.
 * Use it for grain, clouds, terrain or organic motion; drawing it (canvas, SVG, shader) is the app's job.
 * @example
 * const noise = new ValueNoise(42)
 * noise.at(1.5, 2.25) // e.g. 0.63
 */
class ValueNoise {
	readonly #permutation: Uint8Array;
	readonly #values: Float64Array;

	constructor(seed?: number) {
		const random = new Random(seed);
		const order = random.shuffle([...Array(NOISE_PERIOD).keys()]);
		this.#permutation = new Uint8Array(NOISE_PERIOD * 2);
		order.forEach((value, index) => {
			this.#permutation[index] = value;
			this.#permutation[index + NOISE_PERIOD] = value;
		});
		this.#values = Float64Array.from({ length: NOISE_PERIOD }, () => random.uniform());
	}

	/** Noise at a point; one unit is one cell of random values, smoothly blended. */
	at(x: number, y: number): number {
		const cellX = Math.floor(x);
		const cellY = Math.floor(y);
		const blendX = ValueNoise.#smooth(x - cellX);
		const blendY = ValueNoise.#smooth(y - cellY);
		const topLeft = this.#value(cellX, cellY);
		const topRight = this.#value(cellX + 1, cellY);
		const bottomLeft = this.#value(cellX, cellY + 1);
		const bottomRight = this.#value(cellX + 1, cellY + 1);
		const top = topLeft + (topRight - topLeft) * blendX;
		const bottom = bottomLeft + (bottomRight - bottomLeft) * blendX;
		return top + (bottom - top) * blendY;
	}

	/** Several octaves of noise added together and normalized to `[0, 1]` — more natural detail. */
	fractal(x: number, y: number, options: TFractalOptions = {}): number {
		const { octaves = FRACTAL_DEFAULTS.OCTAVES, lacunarity = FRACTAL_DEFAULTS.LACUNARITY, gain = FRACTAL_DEFAULTS.GAIN } = options;
		let total = 0;
		let weight = 1;
		let frequency = 1;
		let weights = 0;
		for (let octave = 0; octave < octaves; octave++) {
			total += this.at(x * frequency, y * frequency) * weight;
			weights += weight;
			weight *= gain;
			frequency *= lacunarity;
		}
		return weights === 0 ? 0 : total / weights;
	}

	#value(cellX: number, cellY: number): number {
		const wrappedX = ((cellX % NOISE_PERIOD) + NOISE_PERIOD) % NOISE_PERIOD;
		const wrappedY = ((cellY % NOISE_PERIOD) + NOISE_PERIOD) % NOISE_PERIOD;
		return this.#values[this.#permutation[this.#permutation[wrappedX] + wrappedY]];
	}

	static #smooth(fraction: number): number {
		return fraction * fraction * (3 - 2 * fraction);
	}
}

export { ValueNoise };
