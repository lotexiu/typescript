[← Voltar para PROJECT.md](../PROJECT.md)

# html/plugins/number

<a id="NumberPlugin"></a>
#### [`NumberPlugin`](../../src/html/plugins/number/model.ts#L18) _(class)_

NumberPlugin
Responsabilidade única: converter texto bruto em number (ou undefined),
opcionalmente restrito a um intervalo [min, max]. Não valida (não reporta
erro nem sinaliza "inválido") e não formata para exibição — isso é
trabalho de outros plugins, compostos por quem consome.

min/max aqui é *correção* (o valor guardado já sai dentro do intervalo),
diferente de validação (que sinalizaria erro sem alterar o valor).

<a id="parsed"></a>
#### [`parsed`](../../src/html/plugins/number/model.ts#L36) _(const)_

<a id="current"></a>
#### [`current`](../../src/html/plugins/number/model.ts#L45) _(const)_

<a id="TNumberPluginOptions"></a>
#### [`TNumberPluginOptions`](../../src/html/plugins/number/types.ts#L2) _(interface, type-only)_

Constructor/`setLimits` options for `NumberPlugin` — `min`/`max` clamp the parsed value, they don't validate it.
