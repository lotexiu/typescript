# `subscription`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`SUBSCRIPTION_LOCALES`](#subscription_locales) | constante | Messages of the errors thrown by `Subscription`. |
| [`Subscription`](#subscription) | classe | An event emitter that keeps no value (use `signal` for state). A listener that throws does not stop the others. |
| [`TValueListener`](#tvaluelistener) | tipo | Receives a value. |
| [`TValueUnsubscribe`](#tvalueunsubscribe) | tipo | Stops listening. |
| [`TSubscription`](#tsubscription) | tipo | Anything you can subscribe to. |

---

## `SUBSCRIPTION_LOCALES`

constante · [src/subscription/declarations.ts:4](../../src/subscription/declarations.ts#L4)

Messages of the errors thrown by `Subscription`.

```ts
const SUBSCRIPTION_LOCALES
```

### Estáticos

#### `'en-US': { manyListenersFailed: 'Multiple listeners threw.', }`

#### `'pt-BR': { manyListenersFailed: 'Vários listeners lançaram erro.', }`

---

## `Subscription`

classe · [src/subscription/model.ts:7](../../src/subscription/model.ts#L7)

An event emitter that keeps no value (use `signal` for state). A listener that throws does not stop the others.

```ts
class Subscription<T = void>
```

### Métodos

#### `subscribe(listener: TValueListener<T>): TValueUnsubscribe`

Adds a listener. Returns the function that removes it.

#### `notify(value: T): void`

Calls every listener with `value`.

#### `dispose(): void`

Removes every listener.

---

## `TValueListener`

tipo · [src/subscription/types.ts:2](../../src/subscription/types.ts#L2)

Receives a value.

```ts
type TValueListener<T> = (value: T) => void
```

---

## `TValueUnsubscribe`

tipo · [src/subscription/types.ts:5](../../src/subscription/types.ts#L5)

Stops listening.

```ts
type TValueUnsubscribe = () => void
```

---

## `TSubscription`

tipo · [src/subscription/types.ts:8](../../src/subscription/types.ts#L8)

Anything you can subscribe to.

```ts
type TSubscription = { … }
```

### Métodos

#### `subscribe(listener: TValueListener<any>): TValueUnsubscribe`

Adds a listener and returns how to remove it.
