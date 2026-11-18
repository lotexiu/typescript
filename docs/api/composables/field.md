# `composables/field`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Field`](#field) | tipo | A computed view of part of a signal that can also write that part back. |
| [`Field`](#field) | constante | Methods shared by every instance (assigned to each one) and the `instanceof` check. |
| [`field`](#field) | função | Reads part of `source` with `getter`; `set` mutates the source in place with `setter` and notifies it. |
| [`TFieldGet`](#tfieldget) | tipo | Reads the part from the source. |
| [`TFieldSet`](#tfieldset) | tipo | Writes the part into the source (in place). |

---

## `Field`

tipo · [src/composables/field/model.ts:8](../../../src/composables/field/model.ts#L8)

A computed view of part of a signal that can also write that part back.

```ts
type Field<V> = Computed<V> & { set: TReactiveSet<V>; update: TReactiveUpdate<V>; }
```

---

## `Field`

constante · [src/composables/field/model.ts:13](../../../src/composables/field/model.ts#L13)

Methods shared by every instance (assigned to each one) and the `instanceof` check.

```ts
const Field
```

---

## `field`

função · [src/composables/field/model.ts:40](../../../src/composables/field/model.ts#L40)

Reads part of `source` with `getter`; `set` mutates the source in place with `setter` and notifies it.

```ts
function field<S, V>( source: Signal<S>, getter: TFieldGet<S, V>, setter: TFieldSet<S, V> ): Field<V>
```

**Exemplo**

```ts
const user = signal({ name: 'Ana' })
const name = field(user, (value) => value.name, (value, next) => (value.name = next))
name.set('Bia')
```

---

## `TFieldGet`

tipo · [src/composables/field/types.ts:6](../../../src/composables/field/types.ts#L6)

Reads the part from the source.

```ts
type TFieldGet<S, V> = (source: S) => V
```

---

## `TFieldSet`

tipo · [src/composables/field/types.ts:9](../../../src/composables/field/types.ts#L9)

Writes the part into the source (in place).

```ts
type TFieldSet<S, V> = (source: S, value: V) => void
```
