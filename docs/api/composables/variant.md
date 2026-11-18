# `composables/variant`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`variant`](#variant) | função | A value derived from a key: changing `key` recomputes the value with `derive`. |
| [`Variant`](#variant) | tipo | What `variant` returns: the derived value, its `key` signal and `derive`. |
| [`Variant`](#variant) | constante | The `instanceof` check of `variant` instances. |
| [`TVariantDerive`](#tvariantderive) | tipo | Resolves the value for a given variant name — the function a `VariantCell` is constructed with. |
| [`TVariant`](#tvariant) | tipo | A key with its derived value. |

---

## `variant`

função · [src/composables/variant/model.ts:6](../../../src/composables/variant/model.ts#L6)

A value derived from a key: changing `key` recomputes the value with `derive`.

```ts
function variant<K, V>(derive: TVariantDerive<K, V>, initial: K): Variant<K, V>
```

---

## `Variant`

tipo · [src/composables/variant/model.ts:15](../../../src/composables/variant/model.ts#L15)

What `variant` returns: the derived value, its `key` signal and `derive`.

```ts
type Variant<K, V> = Computed<V> & { key: Signal<K>; derive: TVariantDerive<K, V>; }
```

---

## `Variant`

constante · [src/composables/variant/model.ts:20](../../../src/composables/variant/model.ts#L20)

The `instanceof` check of `variant` instances.

```ts
const Variant
```

---

## `TVariantDerive`

tipo · [src/composables/variant/types.ts:2](../../../src/composables/variant/types.ts#L2)

Resolves the value for a given variant name — the function a `VariantCell` is constructed with.

```ts
type TVariantDerive<TName, TValue> = (name: TName) => TValue
```

---

## `TVariant`

tipo · [src/composables/variant/types.ts:4](../../../src/composables/variant/types.ts#L4)

A key with its derived value.

```ts
type TVariant<Key, Value> = { … }
```

### Propriedades

#### `key: Key`

The key.

#### `value: Value`

The value derived from it.
