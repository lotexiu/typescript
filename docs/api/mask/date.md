# `mask/date`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TDateOrder`](#tdateorder) | tipo | Ordem de ano (`y`), mês (`m`) e dia (`d`). |
| [`TMaskDateConfig`](#tmaskdateconfig) | tipo | Configuração de `Mask.date`: ordem e separador. |
| [`MaskDateUtils`](#maskdateutils) | classe | Monta definições de máscara de data a partir de ordem e separador. |

---

## `TDateOrder`

tipo · [src/mask/date/types.ts:2](../../../src/mask/date/types.ts#L2)

Ordem de ano (`y`), mês (`m`) e dia (`d`).

```ts
type TDateOrder = 'ymd' | 'dmy' | 'mdy'
```

---

## `TMaskDateConfig`

tipo · [src/mask/date/types.ts:4](../../../src/mask/date/types.ts#L4)

Configuração de `Mask.date`: ordem e separador.

```ts
type TMaskDateConfig = Readonly<{ order: TDateOrder; separator?: string }>
```

---

## `MaskDateUtils`

classe · [src/mask/date/utils.ts:8](../../../src/mask/date/utils.ts#L8)

Monta definições de máscara de data a partir de ordem e separador.

```ts
class MaskDateUtils
```

### Estáticos

#### `static definition({ order, separator = '-' }: TMaskDateConfig): TMaskDefinition`

Máscara de data: ordem e separador são **parâmetros** (nada de região embutida). Valor tipado = `PlainDate`; checa o calendário.
