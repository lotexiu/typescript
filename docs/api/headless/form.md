# `headless/form`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Form`](#form) | classe | Builds one headless control per definition, all bound to a single record of values — a screen assembled from data. Each `kind` gets its control (`range` → `Slider`, `toggle` → `Switch`/`Checkbox`, `choice` → `Select`/`RadioGroup`, `text` → `TextField`), typed per id. The values can live outside (`values: writable(read, write)`), e.g. a theme's adjustments. |
| [`TControlFor`](#tcontrolfor) | tipo | Headless control type `Form` creates for a definition. |
| [`TFormControls`](#tformcontrols) | tipo | The controls of a form, by id. |
| [`TFormField`](#tformfield) | tipo | Id, definition and control of one form entry. |
| [`TFormOptions`](#tformoptions) | tipo | Options of a `Form`. |

---

## `Form`

classe · [src/headless/form/model.ts:30](../../../src/headless/form/model.ts#L30)

Builds one headless control per definition, all bound to a single record of values — a screen assembled from data.
Each `kind` gets its control (`range` → `Slider`, `toggle` → `Switch`/`Checkbox`, `choice` → `Select`/`RadioGroup`, `text` → `TextField`),
typed per id. The values can live outside (`values: writable(read, write)`), e.g. a theme's adjustments.

```ts
class Form<Definitions extends TControlDefinitions>
```

Estende [`TControlDefinitions`](definition.md#tcontroldefinitions) — os membros herdados estão documentados lá.

**Exemplo**

```ts
const form = new Form({ definitions: { volume: { kind: 'range', default: 5, min: 0, max: 10 }, mute: { kind: 'toggle', default: false } } })
form.controls.volume.increment()
form.values() // { volume: 6, mute: false }
```

### Construtor

#### `constructor(options: TFormOptions<Definitions>)`

### Propriedades

#### `readonly id: string`

Base id; each control gets `<form id>-<definition id>`.

#### `readonly definitions: Definitions`

The definitions the form was built from.

#### `readonly values: TWritable<TControlValues<Definitions>>`

Every value by id.

#### `readonly disabled: TReactive<boolean>`

Disables every control.

#### `readonly controls: TFormControls<Definitions>`

The control of each definition, by id.

#### `readonly fields: readonly TFormField<Definitions>[]`

Id, definition and control of each definition, in declaration order — iterate it to render the form.

#### `readonly dirty: Computed<boolean>`

Some control differs from its initial value.

#### `readonly invalid: Computed<boolean>`

Some text control has an error.

### Métodos

#### `assign(assignment: TControlAssignment<Definitions>): void`

Sets some values at once. Throws `LocaleError` for an unknown id or a value that does not fit.

#### `reset(): void`

Puts every control back to its initial value.

---

## `TControlFor`

tipo · [src/headless/form/types.ts:11](../../../src/headless/form/types.ts#L11)

Headless control type `Form` creates for a definition.

```ts
type TControlFor<Definition> = Definition extends TRangeDefinition
? Slider
: Definition extends TToggleDefinition
	? Definition extends { readonly control: 'checkbox' }
		? Checkbox
		: Switch
	: Definition extends TChoiceDefinition<infer Option>
		? Definition extends { readonly control: 'radio' }
			? RadioGroup<Option, Option>
			: Select<Option, Option>
		: Definition extends TTextDefinition
			? TextField
			: never
```

Estende [`TRangeDefinition`](definition.md#trangedefinition) — os membros herdados estão documentados lá.

---

## `TFormControls`

tipo · [src/headless/form/types.ts:26](../../../src/headless/form/types.ts#L26)

The controls of a form, by id.

```ts
type TFormControls<Definitions extends TControlDefinitions> = { … }
```

Estende [`TControlDefinitions`](definition.md#tcontroldefinitions) — os membros herdados estão documentados lá.

---

## `TFormField`

tipo · [src/headless/form/types.ts:31](../../../src/headless/form/types.ts#L31)

Id, definition and control of one form entry.

```ts
type TFormField<Definitions extends TControlDefinitions> = {
	readonly [Id in keyof Definitions & string]: {
		readonly id: Id;
		readonly definition: Definitions[Id];
		readonly control: TControlFor<Definitions[Id]>;
	};
}[keyof Definitions & string]
```

Estende [`TControlDefinitions`](definition.md#tcontroldefinitions) — os membros herdados estão documentados lá.

---

## `TFormOptions`

tipo · [src/headless/form/types.ts:40](../../../src/headless/form/types.ts#L40)

Options of a `Form`.

```ts
type TFormOptions<Definitions extends TControlDefinitions> = { … }
```

Estende [`TControlDefinitions`](definition.md#tcontroldefinitions) — os membros herdados estão documentados lá.

### Propriedades

#### `readonly definitions: Definitions`

What to build.

#### `readonly values?: TControlAssignment<Definitions> | TWritable<TControlValues<Definitions>>`

Initial values (checked against the definitions), or a writable holding every value.

#### `readonly id?: string`

Base id of the controls.

#### `readonly disabled?: TMaybeReactive<boolean>`

Disables every control.
