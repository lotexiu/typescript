import { derived, signal } from '@ts/signal/model';
import { TSignal } from '@ts/signal/types';
import Color, { ColorTypes } from 'colorjs.io';
import { ColorSpace } from 'colorjs.io/fn';
import { TONE_STOPS } from './declarations';
import { TToneStop, TToneStops } from './types';

abstract class Palette {
	readonly name: TSignal<string>;

	constructor(name: string) {
		this.name = signal(name);
	}

	abstract get(toneStop: TToneStop): Color;

	rangeTo(toneStop: TToneStop, space: string | ColorSpace = 'srgb') {
		return this.get(toneStop).toGamut({ space }).to(space);
	}

	opposite(value: TToneStop | Color): TToneStop {
		const toneStop = value instanceof Color ? this.lightness(value) : value;
		const target = 100 - toneStop;
		return TONE_STOPS.reduce<TToneStop>(
			(closest, stop) => (Math.abs(stop - target) < Math.abs(closest - target) ? stop : closest),
			TONE_STOPS[0]
		);
	}

	chroma(value: Color): TToneStop {
		const target = value.to('oklch').coords[1] ?? 0;
		return this.#closestToneStop((toneStop) => this.get(toneStop).to('oklch').coords[1] ?? 0, target);
	}

	lightness(value: Color): TToneStop {
		const target = value.to('oklch').coords[0] ?? 0;
		return this.#closestToneStop((toneStop) => this.get(toneStop).to('oklch').coords[0] ?? 0, target);
	}

	#closestToneStop(extract: (toneStop: TToneStop) => number, target: number): TToneStop {
		return TONE_STOPS.reduce<TToneStop>(
			(closest, stop) => (Math.abs(extract(stop) - target) < Math.abs(extract(closest) - target) ? stop : closest),
			TONE_STOPS[0]
		);
	}
}

class CustomPalette extends Palette {
	readonly #tones = new Map<TToneStop, Color>();

	constructor(
		name: string,
		public readonly seedTones: Record<number, string>
	) {
		super(name);
	}

	get(toneStop: TToneStop): Color {
		let tone = this.#tones.get(toneStop);
		if (tone === undefined) {
			tone = new Color(this.seedTones[toneStop]);
			this.#tones.set(toneStop, tone);
		}
		return tone;
	}
}

class TonalPalette<T extends ColorTypes = string> extends Palette {
	readonly seed: TSignal<T>;
	// Refeito quando a semente muda: a semente em oklch + um cache vazio, preenchido tom a tom sob demanda.
	// Ler `get()` dentro de um derived registra a paleta como dependência (troca de semente o recalcula).
	readonly #tones = derived(() => ({
		seedOklch: new Color(this.seed()).to('oklch'),
		cache: new Map<TToneStop, Color>(),
	}));

	constructor(seed: T, name: string) {
		super(name);
		this.seed = signal(seed);
	}

	get(toneStop: TToneStops[number]): Color {
		const { seedOklch, cache } = this.#tones();
		let tone = cache.get(toneStop);
		if (tone === undefined) {
			const [, chroma, hue] = seedOklch.coords;
			tone = new Color('oklch', [toneStop / 100, chroma, hue]);
			cache.set(toneStop, tone);
		}
		return tone;
	}
}

export { Palette, CustomPalette, TonalPalette };
