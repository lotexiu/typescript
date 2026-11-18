# `theme`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`THEME_LOCALES`](#theme_locales) | constante | Messages of the errors thrown by `Theme`. |
| [`TPaletteAssignment`](#tpaletteassignment) | tipo | Palette id → palette. Ids left out (or `undefined`) fall back to the style's default palette. |
| [`TThemeAdjustments`](#tthemeadjustments) | tipo | Adjustment values assigned to a theme (only some ids; the rest use the style defaults). |
| [`TThemeTokens`](#tthemetokens) | tipo | What the style's `tokens` function returns. |
| [`Theme`](#theme) | classe | A style + the palettes assigned to its ids + the user's settings (`mode`, `contrast`, `enforce`), resolved into colors. Everything is a signal, so a UI or an adapter only reads `roles()`/`components()` and re-runs on change. How those reach a component (CSS variables, props, bindings) is up to the app. |
| [`TThemeMode`](#tthememode) | tipo | Color scheme of a theme. |

---

## `THEME_LOCALES`

constante · [src/theme/declarations.ts:4](../../src/theme/declarations.ts#L4)

Messages of the errors thrown by `Theme`.

```ts
const THEME_LOCALES
```

### Estáticos

#### `'en-US': { undeclaredPalette: 'The current style does not declare this palette id. See `cause` for the id and the ids the style declares.', }`

#### `'pt-BR': { undeclaredPalette: 'O estilo atual não declara este id de paleta. Veja `cause` para o id e os ids que o estilo declara.', }`

---

## `TPaletteAssignment`

tipo · [src/theme/model.ts:18](../../src/theme/model.ts#L18)

Palette id → palette. Ids left out (or `undefined`) fall back to the style's default palette.

```ts
type TPaletteAssignment<S extends ThemeStyle = ThemeStyle> = Readonly<Partial<Record<keyof S['palettes'] & string, Palette>>>
```

Estende [`ThemeStyle`](theme/style.md#themestyle) — os membros herdados estão documentados lá.

---

## `TThemeAdjustments`

tipo · [src/theme/model.ts:21](../../src/theme/model.ts#L21)

Adjustment values assigned to a theme (only some ids; the rest use the style defaults).

```ts
type TThemeAdjustments<S extends ThemeStyle = ThemeStyle> = TAdjustmentAssignment<S['adjustments']>
```

Estende [`ThemeStyle`](theme/style.md#themestyle) — os membros herdados estão documentados lá.

---

## `TThemeTokens`

tipo · [src/theme/model.ts:24](../../src/theme/model.ts#L24)

What the style's `tokens` function returns.

```ts
type TThemeTokens<S extends ThemeStyle = ThemeStyle> = ReturnType<S['tokens']>
```

Estende [`ThemeStyle`](theme/style.md#themestyle) — os membros herdados estão documentados lá.

---

## `Theme`

classe · [src/theme/model.ts:33](../../src/theme/model.ts#L33)

A style + the palettes assigned to its ids + the user's settings (`mode`, `contrast`, `enforce`), resolved into
colors. Everything is a signal, so a UI or an adapter only reads `roles()`/`components()` and re-runs on change.
How those reach a component (CSS variables, props, bindings) is up to the app.

Which palette an id uses: the one assigned (`palettes`/`setPalettes`), else the style's default for that id.

```ts
class Theme<S extends ThemeStyle = ThemeStyle>
```

Estende [`ThemeStyle`](theme/style.md#themestyle) — os membros herdados estão documentados lá.

### Construtor

#### `constructor({ style, palettes = {} as TPaletteAssignment<S>, adjustments = {} as TThemeAdjustments<S>, mode = 'dark', contrast = 0, enforce = true, }: { style: S; palettes?: TPaletteAssignment<S>; adjustments?: TThemeAdjustments<S>; mode?: TThemeMode; contrast?: number; enforce?: boolean; })`

### Propriedades

#### `readonly mode: Signal<TThemeMode>`

`light` or `dark`.

#### `readonly contrast: Signal<number>`

Contrast level `-1..1` (`0` = default) handed to the style's tone functions.

#### `readonly enforce: Signal<boolean>`

Apply the contrast suggestions (see `checks`) instead of keeping the tones exactly as the style wrote them.

#### `readonly style: Signal<S>`

The style in use. Switching it keeps the assigned palettes and adjustments of the ids the new style also declares.

#### `readonly palettes: Signal<TPaletteAssignment<S>>`

Only what was assigned. Prefer `setPalettes` to change it; `activePalettes` has what is actually in use.

#### `readonly activePalettes: Computed<Record<keyof S['palettes'] & string, Palette>>`

Palette in use for each id the current style declares: the assigned one, else the style's default.

#### `readonly resolved: Computed<{ colors: Record<TRoleNames<S['roles']>, TColor>; checks: TRoleCheck<TRoleNames<S['roles']>>[] }>`

The style resolved for the current mode, palettes and settings — recomputed whenever any of them changes.

#### `readonly roles: Computed<Record<TRoleNames<S['roles']>, TColor>>`

Color of every role the style declares.

#### `readonly checks: Computed<TRoleCheck<TRoleNames<S['roles']>>[]>`

One entry per role that has an `on`/`min` pair: how it measured and, when it failed, the tone that would pass.

#### `readonly components: Computed<S['components']>`

The style's components (whatever the app put there: render functions, class names...).

#### `readonly adjustments: Signal<TThemeAdjustments<S>>`

Adjustment values assigned by the user. Use `setAdjustments` to change them with validation.

#### `readonly activeAdjustments: Computed<TAdjustmentValues<S['adjustments']>>`

Every adjustment of the current style: the assigned value when valid, otherwise the default.

#### `readonly tokens: Computed<TThemeTokens<S>>`

The style's tokens computed from mode, contrast, palettes, role colors and adjustments.

### Métodos

#### `setAdjustments(assignment: TThemeAdjustments<S>): void`

Assigns some adjustments (merged with the current ones). Throws `LocaleError` for an id the style does not declare or a value that does not fit.

#### `bindAdjustments(source: TReactive<TThemeAdjustments<S>>): TValueUnsubscribe`

Keeps the assigned adjustments equal to `source` (now and on every change). Returns the function that stops following it.

#### `setPalettes(assignment: TPaletteAssignment<S>): void`

Assigns palettes to ids — one or several at once. Ids not mentioned keep what they had; `undefined` goes back to
the style's default. Only ids the current style declares are accepted; the assignment is kept across style changes.

#### `bindStyle(source: TReactive<S>): TValueUnsubscribe`

Keeps `style` equal to `source` (applied now and on every change). Returns the function that stops following it.

#### `bindPalettes(source: TReactive<TPaletteAssignment<S>>): TValueUnsubscribe`

Same as `bindStyle`, for the assigned palettes — e.g. a `computed` over the colors the user picked.

---

## `TThemeMode`

tipo · [src/theme/types.ts:3](../../src/theme/types.ts#L3)

Color scheme of a theme.

```ts
type TThemeMode = 'light' | 'dark'
```
