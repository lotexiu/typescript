# `reactive-node`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`SIGNAL_LOCALES`](#signal_locales) | constante | Messages of the errors thrown by the reactive core. |
| [`TEqual`](#tequal) | tipo | Decides whether a new value equals the old one (no change, no notification). Default `Object.is`. |
| [`TReactive`](#treactive) | tipo | Anything readable reactively: call it to read (tracked inside a `computed`), subscribe to changes. |
| [`TReactiveSet`](#treactiveset) | tipo | Replaces the value; returns whether it changed. |
| [`TReactiveUpdate`](#treactiveupdate) | tipo | Replaces the value with `fn(current)`; returns whether it changed. |

---

## `SIGNAL_LOCALES`

constante · [src/reactive-node/declarations.ts:20](../../src/reactive-node/declarations.ts#L20)

Messages of the errors thrown by the reactive core.

```ts
const SIGNAL_LOCALES
```

### Estáticos

#### `'en-US': { cycle: 'Cycle detected: a computed read itself while computing.', writeInComputed: 'Writing to a signal while a computed is computing is not allowed — computed values must not have side effects. Use subscribe() for side effects.', }`

#### `'pt-BR': { cycle: 'Ciclo detectado: um computed leu a si mesmo durante o cálculo.', writeInComputed: 'Escrever num signal durante o cálculo de um computed não é permitido — computed não deve ter efeito colateral. Use subscribe() para efeitos colaterais.', }`

---

## `TEqual`

tipo · [src/reactive-node/types.ts:7](../../src/reactive-node/types.ts#L7)

Decides whether a new value equals the old one (no change, no notification). Default `Object.is`.

```ts
type TEqual<T> = (left: T, right: T) => boolean
```

---

## `TReactive`

tipo · [src/reactive-node/types.ts:10](../../src/reactive-node/types.ts#L10)

Anything readable reactively: call it to read (tracked inside a `computed`), subscribe to changes.

```ts
type TReactive<T> = { … }
```

### Métodos

#### `version(): number`

Changes counter, read without tracking. Lets an adapter (a UI binding, an external store) detect
changes by comparing numbers even when the value is mutated in place and keeps the same reference.

#### `subscribe(listener: TValueListener<T>): TValueUnsubscribe`

Calls `listener` with the new value after each change. Returns the function that unsubscribes.

#### `dispose(): void`

Drops listeners and dependencies.

---

## `TReactiveSet`

tipo · [src/reactive-node/types.ts:24](../../src/reactive-node/types.ts#L24)

Replaces the value; returns whether it changed.

```ts
type TReactiveSet<T> = (value: T) => boolean
```

---

## `TReactiveUpdate`

tipo · [src/reactive-node/types.ts:27](../../src/reactive-node/types.ts#L27)

Replaces the value with `fn(current)`; returns whether it changed.

```ts
type TReactiveUpdate<T> = (fn: TUpdateFn<T>) => boolean
```
