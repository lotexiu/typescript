# `service`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Service`](#service) | classe | Base of an HTTP service: protected `get`/`post`/`put`/`patch`/`delete` going through interceptors chosen by moment, method and route. |
| [`TRequestMethod`](#trequestmethod) | tipo | HTTP methods a `Service` supports. |
| [`THttpFn`](#thttpfn) | tipo | Performs one request. |
| [`TTriggerType`](#ttriggertype) | tipo | When an interceptor runs. |
| [`TInterceptorOptions`](#tinterceptoroptions) | tipo | Which requests an interceptor applies to. |

---

## `Service`

classe · [src/service/model.ts:40](../../src/service/model.ts#L40)

Base of an HTTP service: protected `get`/`post`/`put`/`patch`/`delete` going through interceptors chosen by moment, method and route.

```ts
class Service
```

### Estáticos

#### `static http: Record<TRequestMethod, THttpFn>`

Functions that perform the requests (default `fetch`); replace them to change the transport.

### Métodos

#### `interceptor(handler: Function, options?: TInterceptorOptions)`

Registers a handler run `before`, `after` or on `error` of the matching requests. Returns the function that removes it.

---

## `TRequestMethod`

tipo · [src/service/types.ts:4](../../src/service/types.ts#L4)

HTTP methods a `Service` supports.

```ts
type TRequestMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'
```

---

## `THttpFn`

tipo · [src/service/types.ts:6](../../src/service/types.ts#L6)

Performs one request.

```ts
type THttpFn = TFn<any, Promise<any>>
```

---

## `TTriggerType`

tipo · [src/service/types.ts:8](../../src/service/types.ts#L8)

When an interceptor runs.

```ts
type TTriggerType = 'before' | 'after' | 'error'
```

---

## `TInterceptorOptions`

tipo · [src/service/types.ts:11](../../src/service/types.ts#L11)

Which requests an interceptor applies to.

```ts
type TInterceptorOptions = { … }
```

### Propriedades

#### `when?: TTriggerType`

Default `before`.

#### `methods?: TRequestMethod[]`

Default: every method.

#### `routes?: string[]`

URL patterns (`*` wildcard, `!` excludes). Default: every route.
