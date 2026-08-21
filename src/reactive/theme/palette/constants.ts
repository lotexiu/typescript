import { Palette, TonalPalette } from "./model";

const TONE_STOPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100] as const

const BASIC_PALETTES = [
	new TonalPalette('darkgreen', 'Dark Green'),
	new TonalPalette('green', 'Green'),
	new TonalPalette('lightgreen', 'Light Green'),
	new TonalPalette('aquamarine', 'Aquamarine'),
	new TonalPalette('cyan', 'Cyan'),
	new TonalPalette('deepskyblue', 'Deep Sky Blue'),
	new TonalPalette('dodgerblue', 'Dodger Blue'),
	new TonalPalette('blue', 'Blue'),
	new TonalPalette('slateblue', 'Slate Blue'),
	new TonalPalette('blueviolet', 'Blue Violet'),
	new TonalPalette('purple', 'Purple'),
	new TonalPalette('mediumvioletred', 'Medium Violet Red'),
	new TonalPalette('red', 'Red'),
	new TonalPalette('brown', 'brown'),
	new TonalPalette('orange', 'Orange'),
	new TonalPalette('yellow', 'Yellow'),
	new TonalPalette('lemonchiffon', 'Lemon Chiffon'),
	new TonalPalette('beige', 'Beige'),
	new TonalPalette('white', 'White'),
	new TonalPalette('black', 'Black'),
]

export {
	TONE_STOPS,
	BASIC_PALETTES
}