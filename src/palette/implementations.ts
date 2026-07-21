import Color from "colorjs.io";
import { createFactory } from "@ts/rule-factory/implementations";
import { TFactoryRules } from "@ts/rule-factory/types";
import { TToneStop, TTonalPalette, TTonalPaletteSeeds } from "./types";

const TONE_STOPS: TToneStop[] = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];

function toHex(color: Color): string {
	return color.toGamut({ space: "srgb" }).to("srgb").toString({ format: "hex" });
}

/** Mesmo matiz/croma OKLCH da semente, variando só a luminosidade (tone). */
function tone(seedOklch: Color, stop: TToneStop): string {
	return toHex(new Color("oklch", [stop / 100, seedOklch.coords[1], seedOklch.coords[2]]));
}

const tonalPaletteRules = TONE_STOPS.reduce((rules, stop) => {
	rules[`tone${stop}`] = {
		derive: ({ seeds }) => tone(new Color(seeds.seed).to("oklch"), stop),
	};
	return rules;
}, {} as TFactoryRules<TTonalPaletteSeeds, TTonalPalette>);

/**
 * Gera a rampa tonal completa (13 paradas, mesmo conjunto popularizado pelo
 * Material 3) a partir de UMA cor-semente. `toGamut` garante que o resultado
 * sempre existe em sRGB de verdade (croma alto pode "vazar" do gamute em
 * tons muito claros/escuros). Cada `toneN` é independente (só depende da
 * seed), sem precisar de `get()`.
 */
const buildTonalPalette = createFactory(tonalPaletteRules);

export {
	buildTonalPalette
}
