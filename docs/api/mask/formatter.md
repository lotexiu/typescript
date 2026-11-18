# `mask/formatter`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`MaskFormatter`](#maskformatter) | classe | Uma máscara pronta para uso: padrão + opções, com os **três valores** do mesmo dado: `masked` (o que se mostra), `unmasked` (só o que o usuário digitou) e `typed` (número, ms, ... via codec). |

---

## `MaskFormatter`

classe · [src/mask/formatter/model.ts:12](../../../src/mask/formatter/model.ts#L12)

Uma máscara pronta para uso: padrão + opções, com os **três valores** do mesmo dado:
`masked` (o que se mostra), `unmasked` (só o que o usuário digitou) e `typed` (número, ms, ... via codec).

```ts
class MaskFormatter<T = string>
```

### Construtor

#### `constructor( readonly engine: MaskEngine, readonly definition: TMaskDefinition )`

### Propriedades

#### `get pattern(): string`

O padrão da definição.

### Métodos

#### `apply(text: string): string`

Formata o texto (números: a partir dos dígitos, da direita para a esquerda).

#### `unapply(text: string): string`

O texto sem máscara.

#### `valid(text: string): boolean`

O texto está completo e na forma exata da máscara? (Não olha as `checks`.)

#### `check(text: string): TMaskCheckResult`

Forma + checagens (faixa, enum, tamanho, dígito verificador). Devolve o **motivo**, nunca lança.

#### `parse(text: string): TMaskParsed<T>`

Os três valores do texto (mascarado, sem máscara, tipado) e o resultado das checagens.

#### `format(typed: T): string`

Valor tipado → texto mascarado (`''` se o valor não é representável).

#### `caret(typedText: string, typedCaret: number, nextText: string = this.apply(typedText)): number`

Onde fica o cursor depois de reformatar. `typedText`/`typedCaret`: o texto como o navegador o deixou e a posição do cursor nele;
`nextText`: o resultado de `apply(typedText)` (calculado aqui se omitido). O cursor acompanha o **dado**, não a posição:
pula literais inseridos pela máscara e, em máscaras da direita para a esquerda, conta a partir do fim.
