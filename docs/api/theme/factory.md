# `theme/factory`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`FACTORY_LOCALES`](#factory_locales) | constante | Messages of the errors thrown by `PaletteFactory`. |
| [`PaletteFactory`](#palettefactory) | classe | Makes the palettes of a theme from a few colors. It declares two things: - `seeds`: the inputs a user can edit (one color, two colors…), each with a label a UI can show and a default; - `palettes`: for each palette id, a rule that produces it from the seeds (`brand.derive(...)`, `brand.neutral()`…). |
| [`TPaletteSeed`](#tpaletteseed) | tipo | What a seed can be given as: a ready palette, or just a color (turned into a tonal palette). |
| [`TSeedDefinition`](#tseeddefinition) | tipo | One input the user can edit. `label` is what a UI shows (defaults to the seed's id). |
| [`TSeedDefinitions`](#tseeddefinitions) | tipo | Seed definitions by id. |
| [`TSeed`](#tseed) | tipo | The same input after the factory normalized it: always a label and always a `Palette`. |
| [`TPaletteContext`](#tpalettecontext) | tipo | What a palette rule receives: every seed, already as a `Palette`. |
| [`TPaletteRule`](#tpaletterule) | tipo | How one palette is produced from the seeds. |
| [`TPaletteRules`](#tpaletterules) | tipo | Palette id → rule. The ids are the ones a `ThemeStyle` declares in its `palettes`. |

---

## `FACTORY_LOCALES`

constante · [src/theme/factory/declarations.ts:4](../../../src/theme/factory/declarations.ts#L4)

Messages of the errors thrown by `PaletteFactory`.

```ts
const FACTORY_LOCALES
```

### Estáticos

#### `'en-US': { unknownSeed: 'This seed id does not exist in the factory. See `cause` for the id and the declared seed ids.', unknownPalette: 'This palette id is not produced by the factory. See `cause` for the id and the ids it produces.', }`

#### `'pt-BR': { unknownSeed: 'Este id de seed não existe na factory. Veja `cause` para o id e os ids de seed declarados.', unknownPalette: 'Este id de paleta não é produzido pela factory. Veja `cause` para o id e os ids que ela produz.', }`

---

## `PaletteFactory`

classe · [src/theme/factory/model.ts:17](../../../src/theme/factory/model.ts#L17)

Makes the palettes of a theme from a few colors. It declares two things:
 - `seeds`: the inputs a user can edit (one color, two colors…), each with a label a UI can show and a default;
 - `palettes`: for each palette id, a rule that produces it from the seeds (`brand.derive(...)`, `brand.neutral()`…).

`build` runs the rules and returns `{ paletteId: Palette }` — what `Theme.setPalettes`/`bindPalettes` take, and,
with the default seeds, what a `ThemeStyle` can use as its mandatory default palettes. Any generated palette can be
replaced by hand (`overrides`). It is a plain function of its arguments, not reactive: call it inside a `computed`.

Swap the factory and the UI adapts, because it reads `seeds` instead of assuming how many colors there are.

```ts
class PaletteFactory<
	const D extends TSeedDefinitions = TSeedDefinitions,
	const R extends TPaletteRules<keyof D & string> = TPaletteRules
>
```

Estende [`TSeedDefinitions`](factory.md#tseeddefinitions) — os membros herdados estão documentados lá.

### Construtor

#### `constructor({ seeds, palettes }: { seeds: D; palettes: R })`

### Propriedades

#### `readonly seeds: Readonly<Record<keyof D & string, TSeed>>`

The inputs, normalized: every seed has a label and a default `Palette`.

### Métodos

#### `build(values: Partial<Record<keyof D & string, TPaletteSeed>> = {}, overrides: Partial<Record<keyof R & string, Palette>> = {}): Record<keyof R & string, Palette>`

Runs every rule. `values` replaces seeds (a color or a `Palette`); the ones left out use their default.
`overrides` puts a hand-picked palette in place of a generated one.

---

## `TPaletteSeed`

tipo · [src/theme/factory/types.ts:5](../../../src/theme/factory/types.ts#L5)

What a seed can be given as: a ready palette, or just a color (turned into a tonal palette).

```ts
type TPaletteSeed = Palette | string | TColor
```

---

## `TSeedDefinition`

tipo · [src/theme/factory/types.ts:8](../../../src/theme/factory/types.ts#L8)

One input the user can edit. `label` is what a UI shows (defaults to the seed's id).

```ts
type TSeedDefinition = { … }
```

### Propriedades

#### `readonly label?: string`

Text for the UI that edits this seed.

#### `readonly default: TPaletteSeed`

Seed used when no value is given.

---

## `TSeedDefinitions`

tipo · [src/theme/factory/types.ts:16](../../../src/theme/factory/types.ts#L16)

Seed definitions by id.

```ts
type TSeedDefinitions = Readonly<Record<string, TSeedDefinition>>
```

---

## `TSeed`

tipo · [src/theme/factory/types.ts:19](../../../src/theme/factory/types.ts#L19)

The same input after the factory normalized it: always a label and always a `Palette`.

```ts
type TSeed = { … }
```

### Propriedades

#### `readonly label: string`

Text for the UI.

#### `readonly default: Palette`

Default seed, as a palette.

---

## `TPaletteContext`

tipo · [src/theme/factory/types.ts:27](../../../src/theme/factory/types.ts#L27)

What a palette rule receives: every seed, already as a `Palette`.

```ts
type TPaletteContext<SeedId extends string = string> = { … }
```

Estende `string`.

### Propriedades

#### `readonly seeds: Readonly<Record<SeedId, Palette>>`

The current seeds as palettes, by id.

---

## `TPaletteRule`

tipo · [src/theme/factory/types.ts:33](../../../src/theme/factory/types.ts#L33)

How one palette is produced from the seeds.

```ts
type TPaletteRule<SeedId extends string = string> = (context: TPaletteContext<SeedId>) => Palette
```

Estende `string`.

---

## `TPaletteRules`

tipo · [src/theme/factory/types.ts:36](../../../src/theme/factory/types.ts#L36)

Palette id → rule. The ids are the ones a `ThemeStyle` declares in its `palettes`.

```ts
type TPaletteRules<SeedId extends string = string, PaletteId extends string = string> = { … }
```

Estende `string`.
