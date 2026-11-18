# `theme/style`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`STYLE_LOCALES`](#style_locales) | constante | Messages of the errors thrown by `ThemeStyle`. |
| [`TPaletteDefaults`](#tpalettedefaults) | tipo | Palette id → the palette the style uses when nobody assigns another one. |
| [`ThemeStyle`](#themestyle) | classe | Everything one visual style decides, and nothing that changes at runtime. The style owns: - `palettes`: the palette ids it needs (two, three, four… — its call) and, for each, a **default** palette. Defaults are mandatory: they are what a `Theme` falls back to for an id nobody assigned, so switching to a style that needs more palettes than the previous one never leaves a role without a color; - `roles`: which palette id, which tone per mode, what each sits on and how readable it must be; - `components` and the contrast `metric` its `min` values are written in. The ids mean nothing to the lib; roles may only cite ids declared in `palettes`. |
| [`SlotColor`](#slotcolor) | tipo | A color with an id, read reactively. |
| [`TStyleContext`](#tstylecontext) | tipo | What a style's `tokens` function receives. |
| [`TStyleTokens`](#tstyletokens) | tipo | A style's token function. |

---

## `STYLE_LOCALES`

constante · [src/theme/style/declarations.ts:4](../../../src/theme/style/declarations.ts#L4)

Messages of the errors thrown by `ThemeStyle`.

```ts
const STYLE_LOCALES
```

### Estáticos

#### `'en-US': { undeclaredPalette: 'A role uses a palette id the style does not declare in `palettes`. See `cause` for the role, the id and the declared ids.', }`

#### `'pt-BR': { undeclaredPalette: 'Um papel usa um id de paleta que o estilo não declara em `palettes`. Veja `cause` para o papel, o id e os ids declarados.', }`

---

## `TPaletteDefaults`

tipo · [src/theme/style/model.ts:11](../../../src/theme/style/model.ts#L11)

Palette id → the palette the style uses when nobody assigns another one.

```ts
type TPaletteDefaults = Readonly<Record<string, Palette>>
```

---

## `ThemeStyle`

classe · [src/theme/style/model.ts:22](../../../src/theme/style/model.ts#L22)

Everything one visual style decides, and nothing that changes at runtime. The style owns:
 - `palettes`: the palette ids it needs (two, three, four… — its call) and, for each, a **default** palette.
   Defaults are mandatory: they are what a `Theme` falls back to for an id nobody assigned, so switching to a
   style that needs more palettes than the previous one never leaves a role without a color;
 - `roles`: which palette id, which tone per mode, what each sits on and how readable it must be;
 - `components` and the contrast `metric` its `min` values are written in.
The ids mean nothing to the lib; roles may only cite ids declared in `palettes`.

```ts
class ThemeStyle<
	const C extends Record<string, any> = Record<string, any>,
	const N extends string = string,
	const P extends TPaletteDefaults = TPaletteDefaults,
	const R extends TRoleRules = TRoleRules,
	const A extends TAdjustmentDefinitions = TAdjustmentDefinitions,
	T extends Record<string, unknown> = Record<string, unknown>
>
```

Estende `Record`.

### Construtor

#### `constructor({ name, palettes, roles, components = {} as C, adjustments = {} as A, tokens = (() => ({})) as unknown as TStyleTokens<keyof P & string, keyof R & string, A, T>, metric = 'WCAG21', }: { name: N; palettes: P; roles: R & TRoleRules<keyof P & string>; components?: C; adjustments?: A; tokens?: TStyleTokens<keyof P & string, keyof R & string, A, T>; metric?: TContrastMetric; })`

### Propriedades

#### `readonly name: N`

Name of the style.

#### `readonly palettes: P`

Palette ids with their default palettes.

#### `readonly roles: R`

Role rules.

#### `readonly components: C`

Whatever the app attaches to the style (components, render functions, class names).

#### `readonly adjustments: A`

Settings the style offers to the user, as control definitions.

#### `readonly tokens: TStyleTokens<keyof P & string, keyof R & string, A, T>`

Computes the style's design tokens from mode, contrast, palettes, role colors and adjustment values.

#### `readonly metric: TContrastMetric`

Contrast metric the roles' `min` values are written in.

---

## `SlotColor`

tipo · [src/theme/style/types.ts:8](../../../src/theme/style/types.ts#L8)

A color with an id, read reactively.

```ts
type SlotColor = { … }
```

### Propriedades

#### `readonly id: string`

Id of the slot.

#### `readonly value: TReactive<TColor>`

The color.

---

## `TStyleContext`

tipo · [src/theme/style/types.ts:16](../../../src/theme/style/types.ts#L16)

What a style's `tokens` function receives.

```ts
type TStyleContext<PaletteId extends string = string, RoleName extends string = string, Adjustments extends TAdjustmentDefinitions = TAdjustmentDefinitions> = { … }
```

Estende `string`.

### Propriedades

#### `readonly mode: TThemeMode`

Current mode.

#### `readonly contrast: number`

Current contrast setting.

#### `readonly palettes: Readonly<Record<PaletteId, Palette>>`

Palette in use for each id.

#### `readonly roles: Readonly<Record<RoleName, TColor>>`

Color of each role.

#### `readonly adjustments: TAdjustmentValues<Adjustments>`

Value of each adjustment.

---

## `TStyleTokens`

tipo · [src/theme/style/types.ts:30](../../../src/theme/style/types.ts#L30)

A style's token function.

```ts
type TStyleTokens<PaletteId extends string = string, RoleName extends string = string, Adjustments extends TAdjustmentDefinitions = TAdjustmentDefinitions, Tokens = Record<string, unknown>> = {
	resolve(context: TStyleContext<PaletteId, RoleName, Adjustments>): Tokens;
}['resolve']
```

Estende `string`.
