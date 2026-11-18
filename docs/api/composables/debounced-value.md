# `composables/debounced-value`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`DebouncedValue`](#debouncedvalue) | tipo | A signal for the live value, with `debounced` holding the last value that stayed unchanged for `delay` ms. `dispose()` drops the subscription that feeds `debounced`. |
| [`DebouncedValue`](#debouncedvalue) | constante | The `instanceof` check of `debouncedValue` instances. |
| [`debouncedValue`](#debouncedvalue) | função | A signal for the live value plus `debounced`, the last value that stayed unchanged for `delay` ms — e.g. a search box. |

---

## `DebouncedValue`

tipo · [src/composables/debounced-value/model.ts:11](../../../src/composables/debounced-value/model.ts#L11)

A signal for the live value, with `debounced` holding the last value that
stayed unchanged for `delay` ms. `dispose()` drops the subscription that feeds `debounced`.

```ts
type DebouncedValue<T> = Signal<T> & { debounced: Computed<T>; }
```

---

## `DebouncedValue`

constante · [src/composables/debounced-value/model.ts:15](../../../src/composables/debounced-value/model.ts#L15)

The `instanceof` check of `debouncedValue` instances.

```ts
const DebouncedValue
```

---

## `debouncedValue`

função · [src/composables/debounced-value/model.ts:24](../../../src/composables/debounced-value/model.ts#L24)

A signal for the live value plus `debounced`, the last value that stayed unchanged for `delay` ms — e.g. a search box.

```ts
function debouncedValue<T>( initial: T, delay: TLazy<number>, equal?: TEqual<T> ): DebouncedValue<T>
```
