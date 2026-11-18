# `reactive-node/computed`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`computed`](#computed) | função | A value derived from signals: dependencies are tracked automatically and the value is recomputed lazily when one changes. Writing to a signal inside `compute` throws. |
| [`Computed`](#computed) | tipo | A read-only reactive value. |
| [`Computed`](#computed) | constante | The `instanceof` check of computed values. |

---

## `computed`

função · [src/reactive-node/computed/model.ts:16](../../../src/reactive-node/computed/model.ts#L16)

A value derived from signals: dependencies are tracked automatically and the value is recomputed lazily when one changes.
Writing to a signal inside `compute` throws.

```ts
function computed<T>(compute: () => T, equal?: TEqual<T>): Computed<T>
```

**Exemplo**

```ts
const count = signal(1)
const double = computed(() => count() * 2)
double() // 2
```

---

## `Computed`

tipo · [src/reactive-node/computed/model.ts:27](../../../src/reactive-node/computed/model.ts#L27)

A read-only reactive value.

```ts
type Computed<T> = TReactive<T>
```

---

## `Computed`

constante · [src/reactive-node/computed/model.ts:29](../../../src/reactive-node/computed/model.ts#L29)

The `instanceof` check of computed values.

```ts
const Computed
```
