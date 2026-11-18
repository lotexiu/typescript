# `natives/proxy`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TProxyProp`](#tproxyprop) | tipo | A property key of `T`. |
| [`TProxyHandler`](#tproxyhandler) | interface | `ProxyHandler` with traps typed by the target's own keys. |
| [`ProxyUtils`](#proxyutils) | classe | Typed wrapper around `Proxy`. |
| [`proxy`](#proxy) | constante | Shortcut for `ProxyUtils.proxy`. |

---

## `TProxyProp`

tipo · [src/natives/proxy/types.ts:2](../../../src/natives/proxy/types.ts#L2)

A property key of `T`.

```ts
type TProxyProp<T> = keyof T & (string | symbol)
```

---

## `TProxyHandler`

interface · [src/natives/proxy/types.ts:5](../../../src/natives/proxy/types.ts#L5)

`ProxyHandler` with traps typed by the target's own keys.

```ts
interface TProxyHandler<T extends object> extends ProxyHandler<T>
```

Estende `object`.

### Métodos

#### `deleteProperty?<Prop extends TProxyProp<T>>(target: T, property: Prop): boolean`

Trap for `delete target[property]`.

#### `get?<Prop extends TProxyProp<T>>(target: T, property: Prop, receiver: any): any`

Trap for reads.

#### `getOwnPropertyDescriptor?<Prop extends TProxyProp<T>>( target: T, property: Prop ): PropertyDescriptor | undefined`

Trap for `Object.getOwnPropertyDescriptor`.

#### `has?<Prop extends TProxyProp<T>>(target: T, property: Prop): boolean`

Trap for `property in target`.

#### `set?<Prop extends TProxyProp<T>>( target: T, property: Prop, newValue: T[Prop], receiver: any ): boolean`

Trap for writes.

---

## `ProxyUtils`

classe · [src/natives/proxy/utils.ts:4](../../../src/natives/proxy/utils.ts#L4)

Typed wrapper around `Proxy`.

```ts
class ProxyUtils
```

### Estáticos

#### `static proxy<T extends object>(value: T, handler: TProxyHandler<T>)`

A `Proxy` of `value` with traps typed by its keys.

---

## `proxy`

constante · [src/natives/proxy/utils.ts:12](../../../src/natives/proxy/utils.ts#L12)

Shortcut for `ProxyUtils.proxy`.

```ts
const proxy = ProxyUtils
```
