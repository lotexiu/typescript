import { Computed, computed } from "@ts/reactive/computed/model";
import { Model, model } from "@ts/reactive/model/model";
import Color, { ColorTypes } from "colorjs.io";
import { ColorSpace } from "colorjs.io/fn";
import { TONE_STOPS } from "./constants";
import { TToneStop, TToneStops } from "./types";

abstract class Palette {
	protected tones: Map<TToneStop, Color> = new Map()
	name: Model<string>

	constructor(name: string){
		this.name = model(name)
	}
	
	abstract get(toneStop: TToneStop): Color

	rangeTo(toneStop: TToneStop, space: string|ColorSpace = 'srgb') {
		return this.get(toneStop).toGamut({space}).to(space)
	}

	opposite(value: TToneStop|Color): TToneStop {
		const toneStop = value instanceof Color ? this.lightness(value) : value
		const target = 100 - toneStop
		return TONE_STOPS.reduce<TToneStop>((closest, stop) =>
			Math.abs(stop - target) < Math.abs(closest - target) ? stop : closest,
			TONE_STOPS[0]
		)
	}

	chroma(value: Color): TToneStop {
		const target = value.to("oklch").coords[1] ?? 0
		return this.closestToneStop((toneStop) => this.get(toneStop).to("oklch").coords[1] ?? 0, target)
	}

	lightness(value: Color): TToneStop {
		const target = value.to("oklch").coords[0] ?? 0
		return this.closestToneStop((toneStop) => this.get(toneStop).to("oklch").coords[0] ?? 0, target)
	}

	private closestToneStop(extract: (toneStop: TToneStop) => number, target: number): TToneStop {
		return TONE_STOPS.reduce<TToneStop>((closest, stop) =>
			Math.abs(extract(stop) - target) < Math.abs(extract(closest) - target) ? stop : closest,
			TONE_STOPS[0]
		)
	}
}

class CustomPalette extends Palette {
	constructor(
		name: string,
		public readonly seedTones: Record<number, string>
	) {super(name)}

	get(toneStop: TToneStop) {
		if (!this.tones.has(toneStop)) {
			this.tones.set(toneStop, new Color(this.seedTones[toneStop]))
		}
		return this.tones.get(toneStop)!
	}
}

class TonalPalette<T extends ColorTypes = string> extends Palette {
	seed: Model<T>
	protected seedOklch: Computed<Color>
	protected changed: boolean = true
	
	constructor(
		seed: T,
		name: string,
	){
		super(name)
		this.seed = model(seed)
		this.seedOklch = computed(()=> {
			this.changed = true
			return new Color(seed).to("oklch")
		}, [this.seed])
	}
	
	get(toneStop: TToneStops[number]) {
		if (this.changed || !this.tones.has(toneStop)) {
			this.tones.clear()
			const lightness = toneStop / 100
			const chroma = this.seedOklch.value.coords[1]
			const hue = this.seedOklch.value.coords[2]
			this.tones.set(toneStop, new Color("oklch", [lightness, chroma, hue]))
			this.changed = false
		}
		return this.tones.get(toneStop)!
	}
}

export {
	Palette,
	CustomPalette,
	TonalPalette
}