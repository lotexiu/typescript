import { TonalPalette } from "./model";

// Seeds corrigidas: L entre 0.40–0.65 em OKLCH para boa distribuição nos extremos
const BASIC = {
  FOREST_GREEN: new TonalPalette('#2d6a2d', 'FOREST_GREEN'),
  PURE_GREEN: new TonalPalette('#1a7f1a', 'PURE_GREEN'),
  SAGE_GREEN: new TonalPalette('#5a9e5a', 'SAGE_GREEN'),
  AQUAMARINE: new TonalPalette('#2ab88a', 'AQUAMARINE'),
  TEAL: new TonalPalette('#008080', 'TEAL'),
  SKY_BLUE: new TonalPalette('#0077b6', 'SKY_BLUE'),
	ROYAL_BLUE: new TonalPalette('#1a5fb4', 'ROYAL_BLUE'),
  COBALT: new TonalPalette('#0047ab', 'COBALT'),
  SLATE_BLUE: new TonalPalette('#5465a0', 'SLATE_BLUE'),
  BLUE_VIOLET: new TonalPalette('#6a21c4', 'BLUE_VIOLET'),
  PURPLE: new TonalPalette('#7b2d8b', 'PURPLE'),
  ROSE_RED: new TonalPalette('#b5174f', 'ROSE_RED'),
  CRIMSON: new TonalPalette('#c0392b', 'CRIMSON'),
  SIENNA: new TonalPalette('#8b4513', 'SIENNA'),
  AMBER_ORANGE: new TonalPalette('#c46200', 'AMBER_ORANGE'),
  GOLDEN: new TonalPalette('#b8860b', 'GOLDEN'),
  OLIVE: new TonalPalette('#808000', 'OLIVE'),
  WARM_GRAY: new TonalPalette('#7d7168', 'WARM_GRAY'),
  COOL_GRAY: new TonalPalette('#607080', 'COOL_GRAY'),
  NEUTRAL: new TonalPalette('#6b6b6b', 'NEUTRAL'),
} as const

// Seeds claras com croma alto — pastéis vibrantes (L 0.78–0.84)
const LIGHT = {
  BLUSH: new TonalPalette('#f28b9f', 'BLUSH'),
  CORAL: new TonalPalette('#f28b72', 'CORAL'),
  PEACH: new TonalPalette('#f7a072', 'PEACH'),
  HONEY: new TonalPalette('#f5c542', 'HONEY'),
  BUTTER: new TonalPalette('#f5d96b', 'BUTTER'),
  LIME: new TonalPalette('#a8d84e', 'LIME'),
  MINT: new TonalPalette('#5ecfb1', 'MINT'),
  BABY_BLUE: new TonalPalette('#6db8e8', 'BABY_BLUE'),
  LAVENDER: new TonalPalette('#a78fdb', 'LAVENDER'),
	LILAC: new TonalPalette('#c07ec0', 'LILAC'),
} as const

// Tons suaves — pastéis com L alto e C baixo (L 0.82–0.90)
const PASTEL = {
  COTTON_CANDY: new TonalPalette('#f4a7c3', 'COTTON_CANDY'),
  ROSE_QUARTZ: new TonalPalette('#e8b4b8', 'ROSE_QUARTZ'),
  MAUVE: new TonalPalette('#d4a8c8', 'MAUVE'),
  PERIWINKLE: new TonalPalette('#b4b8e8', 'PERIWINKLE'),
  POWDER_BLUE: new TonalPalette('#a7c4e8', 'POWDER_BLUE'),
  SEAFOAM: new TonalPalette('#a8d8cf', 'SEAFOAM'),
  PISTACHIO: new TonalPalette('#a8d8a8', 'PISTACHIO'),
  PRIMROSE: new TonalPalette('#e8e0a8', 'PRIMROSE'),
  CHAMPAGNE: new TonalPalette('#e8d5b0', 'CHAMPAGNE'),
  APRICOT: new TonalPalette('#f0c8a0', 'APRICOT'),
} as const

// Croma máximo no sRGB — neons saturados (L 0.75–0.88)
const NEON = {
  NEON_GREEN: new TonalPalette('#39ff14', 'NEON_GREEN'),
	NEON_LIME: new TonalPalette('#ccff00', 'NEON_LIME'),
  NEON_YELLOW: new TonalPalette('#ffe800', 'NEON_YELLOW'),
  NEON_ORANGE: new TonalPalette('#ff6600', 'NEON_ORANGE'),
  NEON_RED: new TonalPalette('#ff1a1a', 'NEON_RED'),
  NEON_PINK: new TonalPalette('#ff2d78', 'NEON_PINK'),
  NEON_MAGENTA: new TonalPalette('#ff00cc', 'NEON_MAGENTA'),
  NEON_PURPLE: new TonalPalette('#bf00ff', 'NEON_PURPLE'),
  NEON_BLUE: new TonalPalette('#1a8cff', 'NEON_BLUE'),
  NEON_CYAN: new TonalPalette('#00f5ff', 'NEON_CYAN'),
} as const

// Seeds escuras com croma alto — cores profundas (L 0.30–0.40)
const DARK = {
  DEEP_OLIVE: new TonalPalette('#3a4a0a', 'DEEP_OLIVE'),
  DEEP_FOREST: new TonalPalette('#1a4d1a', 'DEEP_FOREST'),
	CHARCOAL_TEAL: new TonalPalette('#1a3a3a', 'CHARCOAL_TEAL'),
  DARK_TEAL: new TonalPalette('#0a4a45', 'DARK_TEAL'),
  DEEP_OCEAN: new TonalPalette('#0a3d5c', 'DEEP_OCEAN'),
  MIDNIGHT_BLUE: new TonalPalette('#0d2b6b', 'MIDNIGHT_BLUE'),
  DEEP_PURPLE: new TonalPalette('#3d0f6b', 'DEEP_PURPLE'),
  DARK_PLUM: new TonalPalette('#4a1040', 'DARK_PLUM'),
  DEEP_CRIMSON: new TonalPalette('#7a0f2e', 'DEEP_CRIMSON'),
  ESPRESSO: new TonalPalette('#4a2010', 'ESPRESSO'),
} as const

// Tons terrosos naturais (L 0.42–0.58)
const EARTH = {
  MOSS: new TonalPalette('#4e6b3a', 'MOSS'),
  SAGE: new TonalPalette('#6b8f71', 'SAGE'),
  DESERT: new TonalPalette('#c8a86b', 'DESERT'),
  SAND: new TonalPalette('#c2a060', 'SAND'),
  STONE: new TonalPalette('#7d7060', 'STONE'),
  BARK: new TonalPalette('#7a5230', 'BARK'),
	UMBER: new TonalPalette('#6b4423', 'UMBER'),
  CLAY: new TonalPalette('#b06040', 'CLAY'),
  RUST: new TonalPalette('#b34700', 'RUST'),
  TERRACOTTA: new TonalPalette('#c1440e', 'TERRACOTTA'),
} as const

/** Ready palettes grouped by family (`Basic`, `Light`, `Dark`...). */
const PALETTES_TYPES = {
  Basic: BASIC,
  Light: LIGHT,
  Dark: DARK,
  Neon: NEON,
  Earth: EARTH,
  Pastel: PASTEL,
}

export {
  PALETTES_TYPES
}
