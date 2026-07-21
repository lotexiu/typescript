[← Voltar para PROJECT.md](../PROJECT.md)

# html/plugins/date

<a id="DatePlugin"></a>
#### [`DatePlugin`](../../src/html/plugins/date/model.ts#L15) _(class)_

DatePlugin
Responsabilidade única: converter texto bruto em Date (ou undefined).
Padrão: ISO estrito (yyyy-mm-dd) — nenhuma tentativa de adivinhar formato
local (DD/MM vs MM/DD, fuso, ano de 2 dígitos). Pra qualquer outro formato,
passe sua própria função via `parse`. Não valida nem formata pra exibição
— isso é trabalho de outros plugins, compostos por quem consome.

<a id="TDateParseFn"></a>
#### [`TDateParseFn`](../../src/html/plugins/date/types.ts#L2) _(type, type-only)_

A custom raw-text-to-`Date` parser, for `DatePlugin` options — swap in when the default strict ISO parsing isn't the right format.

<a id="TDatePluginOptions"></a>
#### [`TDatePluginOptions`](../../src/html/plugins/date/types.ts#L5) _(interface, type-only)_

Constructor/`setParse` options for `DatePlugin`.
