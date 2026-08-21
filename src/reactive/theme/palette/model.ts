import { Computed, computed } from "@ts/reactive/computed/model";
import { Model, model } from "@ts/reactive/model/model";
import Color, { ColorTypes } from "colorjs.io";
import { ColorSpace } from "colorjs.io/fn";
import { TToneStop } from "./types";

abstract class AbstractPalette {
	protected tones: Map<TToneStop, Color> = new Map()
	name: Model<string>

	constructor(name: string){
		this.name = model(name)
	}
	
	abstract get(toneStop: TToneStop): Color

	rangeTo(color: Color, space: string|ColorSpace = 'srgb') {
		return color.toGamut({space}).to(space)
	}
}

class Palette extends AbstractPalette {
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

class TonalPalette<T extends ColorTypes = string> extends AbstractPalette {
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
	
	get(toneStop: TToneStop) {
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