# `reactive-node/signal`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`signal`](#signal) | função | A reactive value: call it to read, `set`/`update` to change, `notify` after mutating it in place. |
| [`Signal`](#signal) | tipo | A writable reactive value. |
| [`Signal`](#signal) | constante | `Signal.batch` groups writes into one notification; `Signal.untracked` reads without tracking. Also the `instanceof` check. |

---

## `signal`

função · [src/reactive-node/signal/model.ts:16](../../../src/reactive-node/signal/model.ts#L16)

A reactive value: call it to read, `set`/`update` to change, `notify` after mutating it in place.

```ts
function signal<T>(initial: T, equal?: TEqual<T>): Signal<T>
function signal<T>(initial?: T, equal?: TEqual<T | undefined>): Signal<T | undefined>
```

**Exemplo**

```ts
const names = signal(new Set<string>())
names().add('Ana')
names.notify()
```

---

## `Signal`

tipo · [src/reactive-node/signal/model.ts:32](../../../src/reactive-node/signal/model.ts#L32)

A writable reactive value.

```ts
type Signal<T> = TReactive<T> & { set: TReactiveSet<T>; update: TReactiveUpdate<T>; notify(): void; }
```

---

## `Signal`

constante · [src/reactive-node/signal/model.ts:40](../../../src/reactive-node/signal/model.ts#L40)

`Signal.batch` groups writes into one notification; `Signal.untracked` reads without tracking. Also the `instanceof` check.

```ts
const Signal
```

### Estáticos

#### `batch: <R>(fn: () => R): R => ReactiveNode.batch(fn)`

#### `untracked: <R>(fn: () => R): R => ReactiveNode.untracked(fn)`
