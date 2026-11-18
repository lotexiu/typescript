# `theme/adjustment`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`ADJUSTMENT_LOCALES`](#adjustment_locales) | constante | Messages of the adjustment errors (`undeclaredAdjustment`, `invalidAdjustment`). |
| [`TAdjustmentDefinitions`](#tadjustmentdefinitions) | tipo | The adjustments a style offers (`roundness`, `blur`...): control definitions that a `Form` can turn into a settings screen. |
| [`TAdjustmentValues`](#tadjustmentvalues) | tipo | One value per adjustment. |
| [`TAdjustmentAssignment`](#tadjustmentassignment) | tipo | Some adjustment values. |
| [`AdjustmentUtils`](#adjustmentutils) | classe | Validation of adjustments with theme-specific errors, on top of `DefinitionUtils`. |

---

## `ADJUSTMENT_LOCALES`

constante · [src/theme/adjustment/declarations.ts:4](../../../src/theme/adjustment/declarations.ts#L4)

Messages of the adjustment errors (`undeclaredAdjustment`, `invalidAdjustment`).

```ts
const ADJUSTMENT_LOCALES
```

### Estáticos

#### `'en-US': { undeclaredAdjustment: 'The current style does not declare this adjustment id. See `cause` for the id and the ids the style declares.', invalidAdjustment: 'This value does not fit the adjustment definition. See `cause` for the id, the value and the definition.', }`

#### `'pt-BR': { undeclaredAdjustment: 'O estilo atual não declara este id de ajuste. Veja `cause` para o id e os ids que o estilo declara.', invalidAdjustment: 'Este valor não cabe na definição do ajuste. Veja `cause` para o id, o valor e a definição.', }`

---

## `TAdjustmentDefinitions`

tipo · [src/theme/adjustment/types.ts:6](../../../src/theme/adjustment/types.ts#L6)

The adjustments a style offers (`roundness`, `blur`...): control definitions that a `Form` can turn into a settings screen.

```ts
type TAdjustmentDefinitions = TControlDefinitions
```

---

## `TAdjustmentValues`

tipo · [src/theme/adjustment/types.ts:9](../../../src/theme/adjustment/types.ts#L9)

One value per adjustment.

```ts
type TAdjustmentValues<Definitions extends TAdjustmentDefinitions> = TControlValues<Definitions>
```

Estende [`TAdjustmentDefinitions`](adjustment.md#tadjustmentdefinitions) — os membros herdados estão documentados lá.

---

## `TAdjustmentAssignment`

tipo · [src/theme/adjustment/types.ts:12](../../../src/theme/adjustment/types.ts#L12)

Some adjustment values.

```ts
type TAdjustmentAssignment<Definitions extends TAdjustmentDefinitions> = TControlAssignment<Definitions>
```

Estende [`TAdjustmentDefinitions`](adjustment.md#tadjustmentdefinitions) — os membros herdados estão documentados lá.

---

## `AdjustmentUtils`

classe · [src/theme/adjustment/utils.ts:8](../../../src/theme/adjustment/utils.ts#L8)

Validation of adjustments with theme-specific errors, on top of `DefinitionUtils`.

```ts
class AdjustmentUtils
```

### Estáticos

#### `static validate(definitions: TAdjustmentDefinitions): void`

Throws `LocaleError` (`invalidAdjustment`) when a default does not fit its definition.

#### `static check(definitions: TAdjustmentDefinitions, assignment: Readonly<Record<string, unknown>>): void`

Throws `LocaleError` for an id the definitions do not declare or a value that does not fit.
