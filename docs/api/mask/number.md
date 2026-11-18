# `mask/number`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`MaskNumberUtils`](#masknumberutils) | classe | Número "da direita para a esquerda" a partir dos dígitos digitados (`1234567`, escala 2 → `12.345,67`). Só não negativos. |

---

## `MaskNumberUtils`

classe · [src/mask/number/utils.ts:6](../../../src/mask/number/utils.ts#L6)

Número "da direita para a esquerda" a partir dos dígitos digitados (`1234567`, escala 2 → `12.345,67`). Só não negativos.

```ts
class MaskNumberUtils
```

### Estáticos

#### `static digits(text: string): string`

Só os dígitos do texto.

#### `static format(digits: string, config: TMaskNumber): string`

Dígitos digitados → número formatado com escala, separador decimal e de milhar.

#### `static group(integer: string, separator: string, size: number): string`

Separa a parte inteira em grupos de `size` dígitos a partir da direita.

#### `static toTyped(digits: string, scale: number): number | undefined`

Dígitos digitados → número, com `scale` casas decimais.

#### `static fromTyped(value: number, scale: number): string | undefined`

Número → dígitos com `scale` casas; `undefined` para negativos e não finitos.
