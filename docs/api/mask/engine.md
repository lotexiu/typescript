# `mask/engine`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`MaskEngine`](#maskengine) | classe | Motor de máscaras de caracteres, **por instância**: cada uma tem as próprias regras (as padrão + as que somar), cache de padrões compilados e reatividade. A `Mask` estática usa uma instância padrão. |
| [`TEngineOptions`](#tengineoptions) | tipo | Só o que o motor de caracteres entende (o resto de `TMaskOptions` é do formatador). |

---

## `MaskEngine`

classe · [src/mask/engine/model.ts:15](../../../src/mask/engine/model.ts#L15)

Motor de máscaras de caracteres, **por instância**: cada uma tem as próprias regras (as padrão + as que somar),
cache de padrões compilados e reatividade. A `Mask` estática usa uma instância padrão.

```ts
class MaskEngine
```

### Construtor

#### `constructor(extra: Readonly<Record<string, TMaskRule>> = {}, base?: MaskEngine)`

### Estáticos

#### `static pad(raw: string, pad: TMaskPad | undefined, reversed: boolean | undefined): string`

Completa `raw` com `pad.char` até `pad.length`, do lado de `pad.side` (início quando `reversed`).

### Propriedades

#### `readonly rules = computed(() => [...this.#rules().values()])`

Regras de caractere registradas (reativo).

#### `readonly ruleKeys = computed(() => [...this.#rules().keys()])`

Letras das regras registradas (reativo).

#### `readonly ruleMatcher`

Regex que reconhece qualquer letra de regra num padrão (reativo).

### Métodos

#### `resetRulesToDefault()`

Volta às regras padrão.

#### `clearRules()`

Remove todas as regras.

#### `setRule(key: string, rule: TMaskRule)`

Registra ou troca uma regra; o cache de padrões é limpo.

#### `apply(value: string, mask: string, options: TEngineOptions = {}): string`

Formata `value` com o padrão (`reversed` preenche da direita para a esquerda; `pad` completa com um caractere).

#### `unapply(value: string, mask: string, options: TEngineOptions = {}): string`

Tira os literais, deixando só o que foi digitado.

#### `valid(value: string, mask: string): boolean`

Se o texto está completo e na forma exata do padrão.

#### `validWithoutMask(value: string, mask: string): boolean`

Se o texto sem os literais caberia completo no padrão.

---

## `TEngineOptions`

tipo · [src/mask/engine/types.ts:4](../../../src/mask/engine/types.ts#L4)

Só o que o motor de caracteres entende (o resto de `TMaskOptions` é do formatador).

```ts
type TEngineOptions = Readonly<{ reversed?: boolean; pad?: TMaskPad }>
```
