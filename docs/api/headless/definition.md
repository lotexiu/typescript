# `headless/definition`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`DEFINITION_LOCALES`](#definition_locales) | constante | Messages of the errors thrown by `Form` (`undeclaredControl`, `invalidControl`). |
| [`TRangeDefinition`](#trangedefinition) | tipo | A number inside a range — rendered as a `Slider`. |
| [`TToggleDefinition`](#ttoggledefinition) | tipo | On or off — rendered as a `Switch` (default) or a `Checkbox`. |
| [`TChoiceDefinition`](#tchoicedefinition) | tipo | One option of a fixed list — rendered as a `Select` (default) or a `RadioGroup`. |
| [`TTextDefinition`](#ttextdefinition) | tipo | Free text, optionally masked — rendered as a `TextField`. |
| [`TControlDefinition`](#tcontroldefinition) | tipo | Description of one setting or field, by `kind`. Plain data: it can come from JSON and build a screen at runtime. |
| [`TControlDefinitions`](#tcontroldefinitions) | tipo | Definitions by id — the shape of a form or of a style's adjustments. |
| [`TControlValue`](#tcontrolvalue) | tipo | Value type of a definition: number, boolean, one of the options, or string. |
| [`TControlValues`](#tcontrolvalues) | tipo | One value per definition id. |
| [`TControlAssignment`](#tcontrolassignment) | tipo | Some of the values; the rest stays as it is (or at the default). |
| [`TDefinitionIssue`](#tdefinitionissue) | tipo | Why a value or default was refused — returned instead of thrown. |
| [`DefinitionUtils`](#definitionutils) | classe | Checks and resolves values against control definitions. Problems are returned as `TDefinitionIssue`, never thrown. |

---

## `DEFINITION_LOCALES`

constante · [src/headless/definition/declarations.ts:4](../../../src/headless/definition/declarations.ts#L4)

Messages of the errors thrown by `Form` (`undeclaredControl`, `invalidControl`).

```ts
const DEFINITION_LOCALES
```

### Estáticos

#### `'en-US': { undeclaredControl: 'The form does not declare this control id. See `cause` for the id and the declared ids.', invalidControl: 'This value does not fit the control definition. See `cause` for the id, the value and the definition.', }`

#### `'pt-BR': { undeclaredControl: 'O formulário não declara este id de controle. Veja `cause` para o id e os ids declarados.', invalidControl: 'Este valor não cabe na definição do controle. Veja `cause` para o id, o valor e a definição.', }`

---

## `TRangeDefinition`

tipo · [src/headless/definition/types.ts:4](../../../src/headless/definition/types.ts#L4)

A number inside a range — rendered as a `Slider`.

```ts
type TRangeDefinition = { … }
```

### Propriedades

#### `readonly kind: 'range'`

Discriminant.

#### `readonly label?: string`

Text shown next to the control.

#### `readonly default: number`

Value when nothing was assigned; must fit the range.

#### `readonly min: number`

Smallest value.

#### `readonly max: number`

Largest value.

#### `readonly step?: number`

Values snap to `min + n * step`.

---

## `TToggleDefinition`

tipo · [src/headless/definition/types.ts:20](../../../src/headless/definition/types.ts#L20)

On or off — rendered as a `Switch` (default) or a `Checkbox`.

```ts
type TToggleDefinition = { … }
```

### Propriedades

#### `readonly kind: 'toggle'`

Discriminant.

#### `readonly label?: string`

Text shown next to the control.

#### `readonly default: boolean`

Value when nothing was assigned.

#### `readonly control?: 'switch' | 'checkbox'`

Which control `Form` creates. Default `switch`.

---

## `TChoiceDefinition`

tipo · [src/headless/definition/types.ts:32](../../../src/headless/definition/types.ts#L32)

One option of a fixed list — rendered as a `Select` (default) or a `RadioGroup`.

```ts
type TChoiceDefinition<Option extends string = string> = { … }
```

Estende `string`.

### Propriedades

#### `readonly kind: 'choice'`

Discriminant.

#### `readonly label?: string`

Text shown next to the control.

#### `readonly default: Option`

Value when nothing was assigned; must be one of `options`.

#### `readonly options: readonly Option[]`

The accepted values, in display order.

#### `readonly optionLabels?: Readonly<Partial<Record<Option, string>>>`

Text per option; the option itself is shown when missing.

#### `readonly control?: 'select' | 'radio'`

Which control `Form` creates. Default `select`.

---

## `TTextDefinition`

tipo · [src/headless/definition/types.ts:48](../../../src/headless/definition/types.ts#L48)

Free text, optionally masked — rendered as a `TextField`.

```ts
type TTextDefinition = { … }
```

### Propriedades

#### `readonly kind: 'text'`

Discriminant.

#### `readonly label?: string`

Text shown next to the control.

#### `readonly default: string`

Value when nothing was assigned.

#### `readonly mask?: string | TMaskDefinition`

Mask pattern, preset id or definition (see `Mask`).

#### `readonly maxLength?: number`

Longer text is cut.

#### `readonly required?: boolean`

Empty text is an error.

---

## `TControlDefinition`

tipo · [src/headless/definition/types.ts:66](../../../src/headless/definition/types.ts#L66)

Description of one setting or field, by `kind`. Plain data: it can come from JSON and build a screen at runtime.

```ts
type TControlDefinition = TRangeDefinition | TToggleDefinition | TChoiceDefinition | TTextDefinition
```

---

## `TControlDefinitions`

tipo · [src/headless/definition/types.ts:69](../../../src/headless/definition/types.ts#L69)

Definitions by id — the shape of a form or of a style's adjustments.

```ts
type TControlDefinitions = Readonly<Record<string, TControlDefinition>>
```

---

## `TControlValue`

tipo · [src/headless/definition/types.ts:72](../../../src/headless/definition/types.ts#L72)

Value type of a definition: number, boolean, one of the options, or string.

```ts
type TControlValue<Definition extends TControlDefinition> = Definition extends TRangeDefinition
? number
: Definition extends TToggleDefinition
	? boolean
	: Definition extends { readonly options: readonly (infer Option)[] }
		? Option
		: Definition extends TTextDefinition
			? string
			: never
```

Estende [`TControlDefinition`](definition.md#tcontroldefinition) — os membros herdados estão documentados lá.

---

## `TControlValues`

tipo · [src/headless/definition/types.ts:83](../../../src/headless/definition/types.ts#L83)

One value per definition id.

```ts
type TControlValues<Definitions extends TControlDefinitions> = { … }
```

Estende [`TControlDefinitions`](definition.md#tcontroldefinitions) — os membros herdados estão documentados lá.

---

## `TControlAssignment`

tipo · [src/headless/definition/types.ts:88](../../../src/headless/definition/types.ts#L88)

Some of the values; the rest stays as it is (or at the default).

```ts
type TControlAssignment<Definitions extends TControlDefinitions> = Partial<TControlValues<Definitions>>
```

Estende [`TControlDefinitions`](definition.md#tcontroldefinitions) — os membros herdados estão documentados lá.

---

## `TDefinitionIssue`

tipo · [src/headless/definition/types.ts:91](../../../src/headless/definition/types.ts#L91)

Why a value or default was refused — returned instead of thrown.

```ts
type TDefinitionIssue = { … }
```

### Propriedades

#### `readonly reason: 'undeclared' | 'invalid'`

`undeclared`: unknown id. `invalid`: the value does not fit the definition.

#### `readonly id: string`

Id of the definition.

#### `readonly value: unknown`

The refused value.

#### `readonly definition?: TControlDefinition`

The definition it was checked against.

#### `readonly declared?: readonly string[]`

Ids that exist, for an undeclared one.

---

## `DefinitionUtils`

classe · [src/headless/definition/utils.ts:7](../../../src/headless/definition/utils.ts#L7)

Checks and resolves values against control definitions. Problems are returned as `TDefinitionIssue`, never thrown.

```ts
class DefinitionUtils
```

### Estáticos

#### `static normalize(definition: TControlDefinition, value: unknown): number | boolean | string | undefined`

Fits a value to a definition (clamps and snaps ranges, cuts text), or `undefined` when it is of the wrong kind or not an option.

#### `static invalidDefault(definitions: TControlDefinitions): TDefinitionIssue | undefined`

First definition whose default does not fit it.

#### `static invalidAssignment(definitions: TControlDefinitions, assignment: Readonly<Record<string, unknown>>): TDefinitionIssue | undefined`

First assigned value with an unknown id or that does not fit its definition. `undefined` values are ignored.

#### `static resolve<Definitions extends TControlDefinitions>(definitions: Definitions, assignment: Readonly<Record<string, unknown>>): TControlValues<Definitions>`

Every definition's value: the assigned one when valid, otherwise the default.
