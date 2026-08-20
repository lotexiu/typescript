import { Computed, computed } from "@ts/reactive/computed/model";
import { Model, model } from "@ts/reactive/model/model";
import Color, { ColorTypes } from "colorjs.io";
import { ColorSpace } from "colorjs.io/fn";

abstract class AbstractPalette {
	tones: Map<number, Color> = new Map()

	abstract get(toneStop: number): Color

	rangeTo(color: Color, space: string|ColorSpace = 'srgb') {
		return color.toGamut({space}).to(space)
	}
}

class Palette extends AbstractPalette {
	constructor(public readonly seedTones: Record<number, string>) {super()}

	get(toneStop: number) {
		if (!this.tones.has(toneStop)) {
			this.tones.set(toneStop, new Color(this.seedTones[toneStop]))
		}
		return this.tones.get(toneStop)!
	}
}

class TonalPalette<T extends ColorTypes> extends AbstractPalette {
	seed: Model<T>
	seedOklch: Computed<Color>
	changed: boolean = true
	
	constructor(seed: T){
		super()
		this.seed = model(seed)
		this.seedOklch = computed(()=> {
			this.changed = true
			return new Color(seed).to("oklch")
		}, [this.seed])
	}
	
	get(toneStop: number) {
		if (this.changed || !this.tones.has(toneStop)) {
			this.tones.clear()
			const lightness = toneStop / 100
			const chroma = this.seedOklch.value.coords[1]
			const hue = this.seedOklch.value.coords[2]
			this.tones.set(toneStop, new Color("oklch", [lightness, chroma, hue]))
		}
		return this.tones.get(toneStop)!
	}
}

export {
	Palette,
	TonalPalette
}