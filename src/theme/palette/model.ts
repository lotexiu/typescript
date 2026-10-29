import { computed } from "@tsr-node/computed/model";
import { Signal, signal } from "@tsr-node/signal/model";
import Color, { ColorTypes } from "colorjs.io";
import { ColorSpace } from "colorjs.io/fn";
import { MID_TONE, NEUTRAL_CHROMA, ON_COLOR_TONES, TONE_STOPS } from "./declarations";
import { TPaletteDerive, TToneStop } from "./types";

abstract class Palette {
	readonly name: Signal<string>;

	constructor(name: string) {
		this.name = signal(name);
	}

	/**
	 * `toneStop` is any number in `0..100` (it is the lightness, in percent). The `TToneStop` values
	 * are just the conventional stops — nothing between them is off-limits.
	 */
	abstract get(toneStop: number): Color;

	rangeTo(toneStop: number, space: string | ColorSpace = 'srgb') {
		return this.get(toneStop).toGamut({ space }).to(space);
	}

	opposite(value: number | Color): TToneStop {
		const toneStop = value instanceof Color ? this.lightness(value) : value;
		const target = 100 - toneStop;
		return TONE_STOPS.reduce<TToneStop>(
			(closest, stop) => (Math.abs(stop - target) < Math.abs(closest - target) ? stop : closest),
			TONE_STOPS[0]
		);
	}

	/**
	 * The tone of this palette that reads best on top of `background` (highest WCAG contrast among `candidates`,
	 * by default the darkest and lightest tones). `opposite()` mirrors lightness; this one measures contrast.
	 */
	onColor(background: Color, candidates: readonly number[] = ON_COLOR_TONES): Color {
		return candidates
			.map((tone) => this.get(tone))
			.reduce((best, color) => (color.contrast(background, 'WCAG21') > best.contrast(background, 'WCAG21') ? color : best));
	}

	/** New tonal palette seeded from this one's mid tone — hue-shifted and/or re-saturated. */
	derive({ hueShift = 0, chromaScale = 1, chroma, name }: TPaletteDerive = {}): TonalPalette<Color> {
		const [lightness, baseChroma, hue] = this.get(MID_TONE).to('oklch').coords;
		const nextHue = ((((hue ?? 0) + hueShift) % 360) + 360) % 360;
		const nextChroma = chroma ?? (baseChroma ?? 0) * chromaScale;
		return new TonalPalette(new Color('oklch', [lightness ?? 0.5, nextChroma, nextHue]), name ?? this.name());
	}

	/** Same hue, almost no chroma — the usual base for backgrounds and surfaces. */
	neutral(chroma = NEUTRAL_CHROMA, name?: string): TonalPalette<Color> {
		return this.derive({ chroma, name });
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

/** Palette defined by hand-picked colors per tone; tones in between are interpolated (in oklch) from the nearest picked ones. */
class CustomPalette extends Palette {
	readonly #tones = new Map<number, Color>();
	readonly #anchors: number[];

	constructor(
		name: string,
		public readonly seedTones: Record<number, string>
	) {
		super(name);
		this.#anchors = Object.keys(seedTones).map(Number).sort((left, right) => left - right);
	}

	get(toneStop: number): Color {
		let tone = this.#tones.get(toneStop);
		if (tone === undefined) {
			tone = this.#resolve(toneStop);
			this.#tones.set(toneStop, tone);
		}
		return tone;
	}

	#resolve(toneStop: number): Color {
		const anchors = this.#anchors;
		const exact = this.seedTones[toneStop];
		if (exact !== undefined) return new Color(exact);
		const below = anchors.filter((anchor) => anchor < toneStop).at(-1);
		const above = anchors.find((anchor) => anchor > toneStop);
		if (below === undefined) return new Color(this.seedTones[above!]);
		if (above === undefined) return new Color(this.seedTones[below]);
		const amount = (toneStop - below) / (above - below);
		return new Color(this.seedTones[below]).mix(new Color(this.seedTones[above]), amount, { space: 'oklch' });
	}
}

class TonalPalette<T extends ColorTypes = string> extends Palette {
	readonly seed: Signal<T>;
	// Refeito quando a semente muda: a semente em oklch + um cache vazio, preenchido tom a tom sob demanda.
	// Ler `get()` dentro de um computed registra a paleta como dependência (troca de semente o recalcula).
	readonly #tones = computed(() => ({
		seedOklch: new Color(this.seed()).to('oklch'),
		cache: new Map<number, Color>(),
	}));

	constructor(seed: T, name: string) {
		super(name);
		this.seed = signal(seed);
	}

	get(toneStop: number): Color {
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
