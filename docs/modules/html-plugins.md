[← Voltar para PROJECT.md](../PROJECT.md)

# html/plugins

<a id="TPlugin"></a>
#### [`TPlugin`](../../src/html/plugins/types.ts#L9) _(interface, type-only)_

Contrato mínimo que todo plugin de componente segue: ler o valor atual e
ser avisado quando ele muda. Não define um método de escrita aqui de
propósito — cada plugin escolhe o próprio (parse/update/apply/...), porque
a forma de "escrever" varia por plugin (texto bruto, evento, valor tipado).
