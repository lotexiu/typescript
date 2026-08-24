import { TonalPalette } from "./model";

const TONE_STOPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100] as const

// Seeds corrigidas: L entre 0.40–0.65 em OKLCH para boa distribuição nos extremos
const BASIC = [
  new TonalPalette('#2d6a2d', 'FOREST_GREEN'),
  new TonalPalette('#1a7f1a', 'PURE_GREEN'),
  new TonalPalette('#5a9e5a', 'SAGE_GREEN'),
  new TonalPalette('#2ab88a', 'AQUAMARINE'),
  new TonalPalette('#008080', 'TEAL'),
  new TonalPalette('#0077b6', 'SKY_BLUE'),
	new TonalPalette('#1a5fb4', 'ROYAL_BLUE'),
  new TonalPalette('#0047ab', 'COBALT'),
  new TonalPalette('#5465a0', 'SLATE_BLUE'),
  new TonalPalette('#6a21c4', 'BLUE_VIOLET'),
  new TonalPalette('#7b2d8b', 'PURPLE'),
  new TonalPalette('#b5174f', 'ROSE_RED'),
  new TonalPalette('#c0392b', 'CRIMSON'),
  new TonalPalette('#8b4513', 'SIENNA'),
  new TonalPalette('#c46200', 'AMBER_ORANGE'),
  new TonalPalette('#b8860b', 'GOLDEN'),
  new TonalPalette('#808000', 'OLIVE'),
  new TonalPalette('#7d7168', 'WARM_GRAY'),
  new TonalPalette('#607080', 'COOL_GRAY'),
  new TonalPalette('#6b6b6b', 'NEUTRAL'),
] as const

// Seeds claras com croma alto — pastéis vibrantes (L 0.78–0.84)
const LIGHT = [
  new TonalPalette('#f28b9f', 'BLUSH'),
  new TonalPalette('#f28b72', 'CORAL'),
  new TonalPalette('#f7a072', 'PEACH'),
  new TonalPalette('#f5c542', 'HONEY'),
  new TonalPalette('#f5d96b', 'BUTTER'),
  new TonalPalette('#a8d84e', 'LIME'),
  new TonalPalette('#5ecfb1', 'MINT'),
  new TonalPalette('#6db8e8', 'BABY_BLUE'),
  new TonalPalette('#a78fdb', 'LAVENDER'),
	new TonalPalette('#c07ec0', 'LILAC'),
] as const

// Tons suaves — pastéis com L alto e C baixo (L 0.82–0.90)
const PASTEL = [
  new TonalPalette('#f4a7c3', 'COTTON_CANDY'),
  new TonalPalette('#e8b4b8', 'ROSE_QUARTZ'),
  new TonalPalette('#d4a8c8', 'MAUVE'),
  new TonalPalette('#b4b8e8', 'PERIWINKLE'),
  new TonalPalette('#a7c4e8', 'POWDER_BLUE'),
  new TonalPalette('#a8d8cf', 'SEAFOAM'),
  new TonalPalette('#a8d8a8', 'PISTACHIO'),
  new TonalPalette('#e8e0a8', 'PRIMROSE'),
  new TonalPalette('#e8d5b0', 'CHAMPAGNE'),
  new TonalPalette('#f0c8a0', 'APRICOT'),
] as const

// Croma máximo no sRGB — neons saturados (L 0.75–0.88)
const NEON = [
  new TonalPalette('#39ff14', 'NEON_GREEN'),
	new TonalPalette('#ccff00', 'NEON_LIME'),
  new TonalPalette('#ffe800', 'NEON_YELLOW'),
  new TonalPalette('#ff6600', 'NEON_ORANGE'),
  new TonalPalette('#ff1a1a', 'NEON_RED'),
  new TonalPalette('#ff2d78', 'NEON_PINK'),
  new TonalPalette('#ff00cc', 'NEON_MAGENTA'),
  new TonalPalette('#bf00ff', 'NEON_PURPLE'),
  new TonalPalette('#1a8cff', 'NEON_BLUE'),
  new TonalPalette('#00f5ff', 'NEON_CYAN'),
] as const

// Seeds escuras com croma alto — cores profundas (L 0.30–0.40)
const DARK = [
  new TonalPalette('#3a4a0a', 'DEEP_OLIVE'),
  new TonalPalette('#1a4d1a', 'DEEP_FOREST'),
	new TonalPalette('#1a3a3a', 'CHARCOAL_TEAL'),
  new TonalPalette('#0a4a45', 'DARK_TEAL'),
  new TonalPalette('#0a3d5c', 'DEEP_OCEAN'),
  new TonalPalette('#0d2b6b', 'MIDNIGHT_BLUE'),
  new TonalPalette('#3d0f6b', 'DEEP_PURPLE'),
  new TonalPalette('#4a1040', 'DARK_PLUM'),
  new TonalPalette('#7a0f2e', 'DEEP_CRIMSON'),
  new TonalPalette('#4a2010', 'ESPRESSO'),
] as const

// Tons terrosos naturais (L 0.42–0.58)
const EARTH = [
  new TonalPalette('#4e6b3a', 'MOSS'),
  new TonalPalette('#6b8f71', 'SAGE'),
  new TonalPalette('#c8a86b', 'DESERT'),
  new TonalPalette('#c2a060', 'SAND'),
  new TonalPalette('#7d7060', 'STONE'),
  new TonalPalette('#7a5230', 'BARK'),
	new TonalPalette('#6b4423', 'UMBER'),
  new TonalPalette('#b06040', 'CLAY'),
  new TonalPalette('#b34700', 'RUST'),
  new TonalPalette('#c1440e', 'TERRACOTTA'),
] as const

const PALETTES = {
  Basic: BASIC,
  Light: LIGHT,
  Dark: DARK,
  Neon: NEON,
  Earth: EARTH,
  Pastel: PASTEL,
}

export {
  TONE_STOPS,
  PALETTES
}