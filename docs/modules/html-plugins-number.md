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

<a id="NumberPlugin.subscribe"></a>
- [`subscribe`](../../src/html/plugins/number/model.ts#L31)
  Subscribes to value changes. Returns an unsubscribe function.
<a id="NumberPlugin.parse"></a>
- [`parse`](../../src/html/plugins/number/model.ts#L36)
  Recebe o texto bruto digitado, parseia via NumberUtils e aplica o clamp atual.
<a id="NumberPlugin.setLimits"></a>
- [`setLimits`](../../src/html/plugins/number/model.ts#L42)
  Troca min/max em runtime e reaplica o clamp sobre o valor já armazenado.

<a id="TNumberPluginOptions"></a>
#### [`TNumberPluginOptions`](../../src/html/plugins/number/types.ts#L2) _(interface, type-only)_

Constructor/`setLimits` options for `NumberPlugin` — `min`/`max` clamp the parsed value, they don't validate it.
