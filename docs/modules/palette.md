[← Voltar para PROJECT.md](../PROJECT.md)

# palette

<a id="TONE_STOPS"></a>
#### [`TONE_STOPS`](../../src/palette/implementations.ts#L6) _(const)_

<a id="toHex"></a>
#### [`toHex`](../../src/palette/implementations.ts#L8) _(function)_

<a id="tone"></a>
#### [`tone`](../../src/palette/implementations.ts#L13) _(function)_

Mesmo matiz/croma OKLCH da semente, variando só a luminosidade (tone).

<a id="tonalPaletteRules"></a>
#### [`tonalPaletteRules`](../../src/palette/implementations.ts#L17) _(const)_

<a id="buildTonalPalette"></a>
#### [`buildTonalPalette`](../../src/palette/implementations.ts#L31) _(const)_

Gera a rampa tonal completa (13 paradas, mesmo conjunto popularizado pelo
Material 3) a partir de UMA cor-semente. `toGamut` garante que o resultado
sempre existe em sRGB de verdade (croma alto pode "vazar" do gamute em
tons muito claros/escuros). Cada `toneN` é independente (só depende da
seed), sem precisar de `get()`.

<a id="TToneStop"></a>
#### [`TToneStop`](../../src/palette/types.ts#L2) _(type, type-only)_

The 13 lightness stops `buildTonalPalette` generates (the same set popularized by Material 3).

<a id="TTonalPalette"></a>
#### [`TTonalPalette`](../../src/palette/types.ts#L5) _(type, type-only)_

A full tonal ramp — one hex color per `TToneStop`, keyed as `tone0`..`tone100`.

<a id="TTonalPaletteSeeds"></a>
#### [`TTonalPaletteSeeds`](../../src/palette/types.ts#L10) _(type, type-only)_

Input to `buildTonalPalette`.
