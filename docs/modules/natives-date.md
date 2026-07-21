[← Voltar para PROJECT.md](../PROJECT.md)

# natives/date

<a id="_Date"></a>
#### [`_Date`](../../src/natives/date/implementations.ts#L4) _(class)_

- `@internal`

<a id="_Date.parseISO"></a>
- [`parseISO`](../../src/natives/date/implementations.ts#L10)
  Parse estrito de "yyyy-mm-dd" (ISO 8601, data). undefined se vazio, mal
formatado, ou data de calendário inválida (ex.: 2024-02-30 não vira
março, é rejeitada). Não tenta adivinhar outros formatos de propósito.

<a id="parseISO"></a>
#### [`parseISO`](../../src/natives/date/implementations.ts#L31) _(const)_

Parse estrito de "yyyy-mm-dd" (ISO 8601, data). undefined se vazio, mal
formatado, ou data de calendário inválida (ex.: 2024-02-30 não vira
março, é rejeitada). Não tenta adivinhar outros formatos de propósito.

<a id="DateUtils"></a>
#### [`DateUtils`](../../src/natives/date/utils.ts#L4) _(class)_

Public static wrapper over `_Date` — strict date parsing.

<a id="DateUtils.parseISO"></a>
- [`parseISO`](../../src/natives/date/utils.ts#L5)
  Parse estrito de "yyyy-mm-dd" (ISO 8601, data). undefined se vazio, mal
formatado, ou data de calendário inválida (ex.: 2024-02-30 não vira
março, é rejeitada). Não tenta adivinhar outros formatos de propósito.
