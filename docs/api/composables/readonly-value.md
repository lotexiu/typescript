# `composables/readonly-value`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`readonlyValue`](#readonlyvalue) | função | A value computed on first read and kept: `const text = readonlyValue(() => source.slice(a, b)); text()`. Not reactive. |
| [`TReadOnlyValue`](#treadonlyvalue) | tipo | Function returned by `readonlyValue`. |

---

## `readonlyValue`

função · [src/composables/readonly-value/model.ts:4](../../../src/composables/readonly-value/model.ts#L4)

A value computed on first read and kept: `const text = readonlyValue(() => source.slice(a, b)); text()`. Not reactive.

```ts
function readonlyValue<const T>(compute: () => T)
```

---

## `TReadOnlyValue`

tipo · [src/composables/readonly-value/types.ts:2](../../../src/composables/readonly-value/types.ts#L2)

Function returned by `readonlyValue`.

```ts
type TReadOnlyValue<T> = () => T
```
