# `theme/role`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`ROLE_LOCALES`](#role_locales) | constante | Messages of the errors thrown while resolving roles. |
| [`TRoleContext`](#trolecontext) | tipo | What a role's tone can depend on. `contrast` is a user-facing level (`-1..1`, `0` = default) for tone functions to honor. |
| [`TRoleTone`](#troletone) | tipo | The tone (`0..100`) a role takes: one for every mode, one per mode, or computed from the context. |
| [`TRoleRule`](#trolerule) | tipo | One role of a style: which palette it comes from, which tone, and — optionally — which other role it sits on (`on`) and how readable it must be there (`min`, in the units of the metric used to resolve). Names (`P` for palettes, `R` for roles) are whatever the style's author chose; the lib gives none a meaning. |
| [`TRoleRules`](#trolerules) | tipo | Role name → rule. Resolved in declaration order, so `on` must name a role declared before it. |
| [`TRoleNames`](#trolenames) | tipo | The role names a rule map declares, and the palette names those rules need. |
| [`TRolePalettes`](#trolepalettes) | tipo | Palette ids the rules use. |
| [`TRoleOptions`](#troleoptions) | tipo | Inputs of `RoleUtils.resolve` besides rules and palettes. |
| [`TRoleSuggestion`](#trolesuggestion) | tipo | The nearest tone that satisfies `min`; if none does, the most readable one the palette has. |
| [`TRoleCheck`](#trolecheck) | tipo | The result of one role's `on`/`min` check, measured on the color as authored. |
| [`TRolesResolved`](#trolesresolved) | tipo | Result of resolving roles. |
| [`RoleUtils`](#roleutils) | classe | Turns the roles a style declares into colors. The style decides tones and which role sits on which; this only evaluates them in declaration order and checks the readability of every `on`/`min` pair. Names carry no meaning here. |

---

## `ROLE_LOCALES`

constante · [src/theme/role/declarations.ts:4](../../../src/theme/role/declarations.ts#L4)

Messages of the errors thrown while resolving roles.

```ts
const ROLE_LOCALES
```

### Estáticos

#### `'en-US': { unknownPalette: 'A role points to a palette that was not given. See `cause` for the role and palette.', unresolvedBackground: 'A role sits `on` a role that does not exist or is declared after it. See `cause` for both.', }`

#### `'pt-BR': { unknownPalette: 'Um papel aponta para uma paleta que não foi informada. Veja `cause` para o papel e a paleta.', unresolvedBackground: 'Um papel está `on` outro papel que não existe ou foi declarado depois dele. Veja `cause` para os dois.', }`

---

## `TRoleContext`

tipo · [src/theme/role/types.ts:5](../../../src/theme/role/types.ts#L5)

What a role's tone can depend on. `contrast` is a user-facing level (`-1..1`, `0` = default) for tone functions to honor.

```ts
type TRoleContext = { … }
```

### Propriedades

#### `readonly mode: TThemeMode`

Current mode.

#### `readonly contrast: number`

Current contrast setting, from -1 to 1.

---

## `TRoleTone`

tipo · [src/theme/role/types.ts:13](../../../src/theme/role/types.ts#L13)

The tone (`0..100`) a role takes: one for every mode, one per mode, or computed from the context.

```ts
type TRoleTone = number | Readonly<Record<TThemeMode, number>> | ((context: TRoleContext) => number)
```

---

## `TRoleRule`

tipo · [src/theme/role/types.ts:20](../../../src/theme/role/types.ts#L20)

One role of a style: which palette it comes from, which tone, and — optionally — which other role it sits
on (`on`) and how readable it must be there (`min`, in the units of the metric used to resolve).
Names (`P` for palettes, `R` for roles) are whatever the style's author chose; the lib gives none a meaning.

```ts
type TRoleRule<P extends string = string, R extends string = string> = {
	readonly palette: P;
	readonly tone: TRoleTone;
} & (
	| { readonly on?: undefined; readonly min?: undefined }
	| { readonly on: R; readonly min?: number }
)
```

Estende `string`.

---

## `TRoleRules`

tipo · [src/theme/role/types.ts:29](../../../src/theme/role/types.ts#L29)

Role name → rule. Resolved in declaration order, so `on` must name a role declared before it.

```ts
type TRoleRules<P extends string = string, R extends string = string> = { … }
```

Estende `string`.

---

## `TRoleNames`

tipo · [src/theme/role/types.ts:34](../../../src/theme/role/types.ts#L34)

The role names a rule map declares, and the palette names those rules need.

```ts
type TRoleNames<Rules extends TRoleRules> = keyof Rules & string
```

Estende [`TRoleRules`](role.md#trolerules) — os membros herdados estão documentados lá.

---

## `TRolePalettes`

tipo · [src/theme/role/types.ts:36](../../../src/theme/role/types.ts#L36)

Palette ids the rules use.

```ts
type TRolePalettes<Rules extends TRoleRules> = Rules[keyof Rules]['palette']
```

Estende [`TRoleRules`](role.md#trolerules) — os membros herdados estão documentados lá.

---

## `TRoleOptions`

tipo · [src/theme/role/types.ts:39](../../../src/theme/role/types.ts#L39)

Inputs of `RoleUtils.resolve` besides rules and palettes.

```ts
type TRoleOptions = { … }
```

### Propriedades

#### `readonly mode: TThemeMode`

Mode to resolve for.

#### `readonly contrast?: number`

Default `0`.

#### `readonly metric?: TContrastMetric`

Default `WCAG21`.

#### `readonly enforce?: boolean`

Apply the suggestions instead of only reporting them. Default `false`.

---

## `TRoleSuggestion`

tipo · [src/theme/role/types.ts:51](../../../src/theme/role/types.ts#L51)

The nearest tone that satisfies `min`; if none does, the most readable one the palette has.

```ts
type TRoleSuggestion = { … }
```

### Propriedades

#### `readonly tone: number`

Tone that would pass (or the most readable one).

#### `readonly color: TColor`

Color at that tone.

#### `readonly ratio: number`

Contrast at that tone, in the metric's unit.

---

## `TRoleCheck`

tipo · [src/theme/role/types.ts:61](../../../src/theme/role/types.ts#L61)

The result of one role's `on`/`min` check, measured on the color as authored.

```ts
type TRoleCheck<R extends string = string> = { … }
```

Estende `string`.

### Propriedades

#### `readonly role: R`

The role being checked (the foreground).

#### `readonly on: R`

The role it sits on (the background).

#### `readonly ratio: number`

Measured contrast.

#### `readonly min: number`

Required contrast.

#### `readonly passed: boolean`

Whether `ratio` reaches `min`.

#### `readonly suggestion?: TRoleSuggestion`

Only when it did not pass and a more readable tone exists.

---

## `TRolesResolved`

tipo · [src/theme/role/types.ts:77](../../../src/theme/role/types.ts#L77)

Result of resolving roles.

```ts
type TRolesResolved<R extends string = string> = { … }
```

Estende `string`.

### Propriedades

#### `readonly colors: Record<R, TColor>`

Color of each role (with suggestions applied when enforcing).

#### `readonly checks: TRoleCheck<R>[]`

One check per role with an `on`/`min` pair.

---

## `RoleUtils`

classe · [src/theme/role/utils.ts:14](../../../src/theme/role/utils.ts#L14)

Turns the roles a style declares into colors. The style decides tones and which role sits on which; this only
evaluates them in declaration order and checks the readability of every `on`/`min` pair. Names carry no meaning here.

`Palette.get` is reactive, so calling `resolve` inside a `derived` re-runs it when a palette's seed changes.

```ts
class RoleUtils
```

### Estáticos

#### `static resolve<P extends string, R extends string>( rules: TRoleRules<P, R>, palettes: Readonly<Record<P, Palette>>, options: TRoleOptions ): TRolesResolved<R>`

Turns role rules into colors, in declaration order, measuring each `on`/`min` pair and suggesting (or, with `enforce`, applying) a tone that passes.
