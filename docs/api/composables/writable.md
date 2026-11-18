# `composables/writable`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Writable`](#writable) | tipo | A computed with `set`/`update` that write through a function. |
| [`writable`](#writable) | função | Bridges any state to the signal world: reads through `read` (tracked) and writes through `write`. `set` returns whether the read value changed. |

---

## `Writable`

tipo · [src/composables/writable/model.ts:6](../../../src/composables/writable/model.ts#L6)

A computed with `set`/`update` that write through a function.

```ts
type Writable<T> = Computed<T> & { set: TReactiveSet<T>; update: TReactiveUpdate<T>; }
```

---

## `writable`

função · [src/composables/writable/model.ts:17](../../../src/composables/writable/model.ts#L17)

Bridges any state to the signal world: reads through `read` (tracked) and writes through `write`.
`set` returns whether the read value changed.

```ts
function writable<T>(read: () => T, write: (value: T) => void): Writable<T>
```

**Exemplo**

```ts
const dark = writable(() => theme.mode() === 'dark', (value) => theme.mode.set(value ? 'dark' : 'light'))
```
