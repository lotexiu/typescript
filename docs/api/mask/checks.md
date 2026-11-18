# `mask/checks`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`MaskCheckUtils`](#maskcheckutils) | classe | Executa as checagens (dados) sobre o valor sem máscara. Devolve o primeiro motivo de falha, ou `undefined`. |

---

## `MaskCheckUtils`

classe · [src/mask/checks/utils.ts:8](../../../src/mask/checks/utils.ts#L8)

Executa as checagens (dados) sobre o valor sem máscara. Devolve o primeiro motivo de falha, ou `undefined`.

```ts
class MaskCheckUtils
```

### Estáticos

#### `static run(unmasked: string, checks: readonly TMaskCheck[] = []): TMaskIssue | undefined`

Executa as checagens em ordem; devolve o primeiro motivo de falha, ou `undefined`.

#### `static one(unmasked: string, check: TMaskCheck): TMaskIssue | undefined`

Executa uma checagem.

#### `static date(unmasked: string, { year, month, day }: Extract<TMaskCheck, { type: 'date' }>): TMaskIssue | undefined`

Qualquer trecho vazio = ainda incompleto (passa); completo, a data tem de existir.

#### `static range(part: string, min: number, max: number): TMaskIssue | undefined`

Parte vazia passa (ainda não foi digitada); fora da faixa ou não numérica, não.

#### `static weighted(unmasked: string, specs: readonly TWeightedSpec[]): TMaskIssue | undefined`

Dígitos verificadores por soma ponderada, calculados em sequência (o seguinte inclui os anteriores).
