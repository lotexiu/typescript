[← Voltar para PROJECT.md](../PROJECT.md)

# value-cell

<a id="ValueCell"></a>
#### [`ValueCell`](../../src/value-cell/model.ts#L8) _(class)_

Menor primitivo reativo da lib: guarda um valor e notifica assinantes quando ele muda.
Não sabe de UI/DOM e não é um plugin — é a peça que plugins "adaptadores de util"
(ex.: MaskPlugin) usam por baixo para virar reativos sem reimplementar notify-on-change.

<a id="TValueCellListener"></a>
#### [`TValueCellListener`](../../src/value-cell/types.ts#L2) _(type, type-only)_

Listener signature `ValueCell.subscribe(...)` accepts.

<a id="TValueCellUnsubscribe"></a>
#### [`TValueCellUnsubscribe`](../../src/value-cell/types.ts#L5) _(type, type-only)_

The unsubscribe function `ValueCell.subscribe(...)` returns.
