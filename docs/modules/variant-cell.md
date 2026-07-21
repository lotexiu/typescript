[← Voltar para PROJECT.md](../PROJECT.md)

# variant-cell

<a id="VariantCell"></a>
#### [`VariantCell`](../../src/variant-cell/model.ts#L14) _(class)_

Alterna entre variantes nomeadas de um mesmo tipo de valor — paleta de cor,
conjunto de componentes visuais, etc. Um `ValueCell<TName>` decide qual nome
está ativo; `derive` resolve o valor daquele nome sob demanda, com o
resultado guardado em cache por nome (ex.: uma paleta é gerada uma única
vez por tema, não recalculada a cada leitura). `subscribe` notifica com o
nome ativo, não o valor derivado — quem consome decide se/quando recomputar
o valor a partir do nome (ex.: `useMemo` num hook React).

<a id="VariantCell.set"></a>
- [`set`](../../src/variant-cell/model.ts#L34)
  Switches the active variant to `name`.
<a id="VariantCell.subscribe"></a>
- [`subscribe`](../../src/variant-cell/model.ts#L37)
  Subscribes to the active variant *name* changing (not the derived value). Returns an unsubscribe function.

<a id="TVariantDerive"></a>
#### [`TVariantDerive`](../../src/variant-cell/types.ts#L2) _(type, type-only)_

Resolves the value for a given variant name — the function a `VariantCell` is constructed with.
