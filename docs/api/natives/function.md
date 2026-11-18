# `natives/function`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TFn`](#tfn) | tipo | A function type from its parameters and return type; `'constructor'` gives a constructor type. |
| [`TFnDeclaration`](#tfndeclaration) | tipo | Rewrites a function type with a leading "this-like" parameter into a method declaration with an explicit `this: V` parameter (used to type `thisAsParameter`-wrapped functions). |
| [`TBindFn`](#tbindfn) | tipo | Callable shape returned by `_Function.rebind` — carries the original `fn`, the bound `context`, and the accumulated `args` alongside the callable signature. |
| [`TModifyFnParameters`](#tmodifyfnparameters) | tipo | `Fn`'s type with its parameter list replaced by `Args`, keeping its original return type. |
| [`TModifyFnReturn`](#tmodifyfnreturn) | tipo | `Fn`'s type with its return type replaced by `ReturnType`, keeping its original parameters. |
| [`TParameters`](#tparameters) | tipo | Extracts a function type's parameter tuple (tolerates non-function `T`, resolving to `never` instead of requiring `(...args: any) => any`). |
| [`TReturnType`](#treturntype) | tipo | Extracts a function type's return type — thin alias ov'er the built-in `ReturnType`. |
| [`TReplaceConstructor`](#treplaceconstructor) | tipo | A constructor type with another parameter list and the same instance type. |
| [`TAbstractConstructor`](#tabstractconstructor) | tipo | Any constructor, abstract or not. |
| [`TConstructor`](#tconstructor) | tipo | A concrete constructor. |
| [`TConstructorInfo`](#tconstructorinfo) | tipo | Splits a constructor type into its `{ instance, parameters }` shape. |
| [`TConstructorParameters`](#tconstructorparameters) | tipo | Extracts a constructor type's parameter tuple. |
| [`TInstanceType`](#tinstancetype) | tipo | Extracts a constructor type's instance type — thin alias over the built-in `InstanceType`. |
| [`TDebounceFn`](#tdebouncefn) | tipo | The wrapped function `debounce()` returns — callable like `T`, plus `clear()` to cancel a pending call. |
| [`TThrottleOptions`](#tthrottleoptions) | tipo | Options for `throttle()` — `trailing` replays the last ignored call once the interval ends. |
| [`TThrottleFn`](#tthrottlefn) | tipo | The wrapped function `throttle()` returns — callable like `T`, plus `clear()` to reset its interval tracking. |
| [`TStepFn`](#tstepfn) | tipo | The wrapped function `step()` returns — callable like `T`, plus `clear()` to reset its call counter. |
| [`TOnceFn`](#toncefn) | tipo | The wrapped function `once()` returns — callable like `T`, plus `clear()` to allow it to run again. |
| [`TScheduleOnceFn`](#tscheduleoncefn) | tipo | The wrapped function `scheduleOnce()` returns — `clear()` cancels a pending call, `flush()` runs it immediately (if pending) instead of waiting for the microtask. |
| [`TMemoizeFn`](#tmemoizefn) | tipo | A memoized function, with its `cache` exposed. |
| [`TLazy`](#tlazy) | tipo | A value, or a function that produces it when needed. |
| [`TUpdateFn`](#tupdatefn) | tipo | Receives the current value and returns the next one. |
| [`FunctionUtils`](#functionutils) | classe | Function wrappers: rate limiting (debounce, throttle, once, step), binding, memoizing and currying. |

---

## `TFn`

tipo · [src/natives/function/types.ts:6](../../../src/natives/function/types.ts#L6)

A function type from its parameters and return type; `'constructor'` gives a constructor type.

```ts
type TFn<Args extends any[] = any[], Return = any, Type extends TFnType = 'normal'> =
Type extends 'constructor' ? abstract new (...args: Args) => Return : (...args: Args) => Return
```

Estende `any`.

---

## `TFnDeclaration`

tipo · [src/natives/function/types.ts:10](../../../src/natives/function/types.ts#L10)

Rewrites a function type with a leading "this-like" parameter into a method declaration with an explicit `this: V` parameter (used to type `thisAsParameter`-wrapped functions).

```ts
type TFnDeclaration<T extends TFn> =
T extends (value: infer This, ...args: infer Args) => infer R ?
	<V extends This>(this: V, ...args: Args) => R
:	never
```

Estende [`TFn`](function.md#tfn) — os membros herdados estão documentados lá.

---

## `TBindFn`

tipo · [src/natives/function/types.ts:26](../../../src/natives/function/types.ts#L26)

Callable shape returned by `_Function.rebind` — carries the original `fn`, the bound `context`, and the accumulated `args` alongside the callable signature.

```ts
type TBindFn<Option extends TBindFnOption = TBindFnOption> = { … }
```

Estende `TBindFnOption`.

### Propriedades

#### `fn: TFn`

The original function.

#### `context: Option['context']`

The bound `this`.

#### `args: Option['args']`

Arguments already applied.

---

## `TModifyFnParameters`

tipo · [src/natives/function/types.ts:37](../../../src/natives/function/types.ts#L37)

`Fn`'s type with its parameter list replaced by `Args`, keeping its original return type.

```ts
type TModifyFnParameters<Fn extends TFn, Args extends any[]> =
Fn extends (...args: any[]) => infer ReturnType ? (...args: Args) => ReturnType : never
```

Estende [`TFn`](function.md#tfn) — os membros herdados estão documentados lá.

---

## `TModifyFnReturn`

tipo · [src/natives/function/types.ts:41](../../../src/natives/function/types.ts#L41)

`Fn`'s type with its return type replaced by `ReturnType`, keeping its original parameters.

```ts
type TModifyFnReturn<Fn extends TFn, ReturnType> =
Fn extends (...args: infer Args) => any ? (...args: Args) => ReturnType : never
```

Estende [`TFn`](function.md#tfn) — os membros herdados estão documentados lá.

---

## `TParameters`

tipo · [src/natives/function/types.ts:45](../../../src/natives/function/types.ts#L45)

Extracts a function type's parameter tuple (tolerates non-function `T`, resolving to `never` instead of requiring `(...args: any) => any`).

```ts
type TParameters<T> = T extends (...args: infer P) => any ? P : never
```

---

## `TReturnType`

tipo · [src/natives/function/types.ts:48](../../../src/natives/function/types.ts#L48)

Extracts a function type's return type — thin alias ov'er the built-in `ReturnType`.

```ts
type TReturnType<T extends (...args: any) => any> = ReturnType<T>
```

---

## `TReplaceConstructor`

tipo · [src/natives/function/types.ts:51](../../../src/natives/function/types.ts#L51)

A constructor type with another parameter list and the same instance type.

```ts
type TReplaceConstructor<
	T extends TConstructor,
	NewCtor extends abstract new (...args: any) => any,
> = {
	[K in keyof T]: T[K];
} & NewCtor
```

Estende [`TConstructor`](function.md#tconstructor) — os membros herdados estão documentados lá.

---

## `TAbstractConstructor`

tipo · [src/natives/function/types.ts:59](../../../src/natives/function/types.ts#L59)

Any constructor, abstract or not.

```ts
type TAbstractConstructor<T = any, Args extends any[] = any[]> = abstract new (...args: Args) => T
```

Estende `any`.

---

## `TConstructor`

tipo · [src/natives/function/types.ts:62](../../../src/natives/function/types.ts#L62)

A concrete constructor.

```ts
type TConstructor<T = any, Args extends any[] = any[]> = new (...args: Args) => T
```

Estende `any`.

---

## `TConstructorInfo`

tipo · [src/natives/function/types.ts:65](../../../src/natives/function/types.ts#L65)

Splits a constructor type into its `{ instance, parameters }` shape.

```ts
type TConstructorInfo<T> =
T extends TAbstractConstructor<infer I, infer P> ? { instance: I; parameters: P } : never
```

Estende [`TAbstractConstructor`](function.md#tabstractconstructor) — os membros herdados estão documentados lá.

---

## `TConstructorParameters`

tipo · [src/natives/function/types.ts:69](../../../src/natives/function/types.ts#L69)

Extracts a constructor type's parameter tuple.

```ts
type TConstructorParameters<T> = T extends TAbstractConstructor<any, infer P> ? P : never
```

Estende [`TAbstractConstructor`](function.md#tabstractconstructor) — os membros herdados estão documentados lá.

---

## `TInstanceType`

tipo · [src/natives/function/types.ts:72](../../../src/natives/function/types.ts#L72)

Extracts a constructor type's instance type — thin alias over the built-in `InstanceType`.

```ts
type TInstanceType<T extends abstract new (...args: any) => any> = InstanceType<T>
```

Estende `abstract`.

---

## `TDebounceFn`

tipo · [src/natives/function/types.ts:75](../../../src/natives/function/types.ts#L75)

The wrapped function `debounce()` returns — callable like `T`, plus `clear()` to cancel a pending call.

```ts
type TDebounceFn<Args extends any[]> = TFn<Args, void> & { clear: () => void; }
```

Estende `any`.

---

## `TThrottleOptions`

tipo · [src/natives/function/types.ts:80](../../../src/natives/function/types.ts#L80)

Options for `throttle()` — `trailing` replays the last ignored call once the interval ends.

```ts
type TThrottleOptions = { … }
```

### Propriedades

#### `trailing?: boolean`

Also run the last call that arrived during the wait. Default `false` (leading only).

---

## `TThrottleFn`

tipo · [src/natives/function/types.ts:86](../../../src/natives/function/types.ts#L86)

The wrapped function `throttle()` returns — callable like `T`, plus `clear()` to reset its interval tracking.

```ts
type TThrottleFn<Args extends any[]> = TFn<Args, void> & { clear: () => void; }
```

Estende `any`.

---

## `TStepFn`

tipo · [src/natives/function/types.ts:91](../../../src/natives/function/types.ts#L91)

The wrapped function `step()` returns — callable like `T`, plus `clear()` to reset its call counter.

```ts
type TStepFn<Args extends any[]> = TFn<Args, void> & { clear: () => void; }
```

Estende `any`.

---

## `TOnceFn`

tipo · [src/natives/function/types.ts:96](../../../src/natives/function/types.ts#L96)

The wrapped function `once()` returns — callable like `T`, plus `clear()` to allow it to run again.

```ts
type TOnceFn<Args extends any[]> = TFn<Args, void> & { clear: () => void; }
```

Estende `any`.

---

## `TScheduleOnceFn`

tipo · [src/natives/function/types.ts:101](../../../src/natives/function/types.ts#L101)

The wrapped function `scheduleOnce()` returns — `clear()` cancels a pending call, `flush()` runs it immediately (if pending) instead of waiting for the microtask.

```ts
type TScheduleOnceFn = { … }
```

### Propriedades

#### `clear: () => void`

Cancels a pending run.

#### `flush: () => void`

Runs a pending call now instead of at the end of the microtask.

---

## `TMemoizeFn`

tipo · [src/natives/function/types.ts:110](../../../src/natives/function/types.ts#L110)

A memoized function, with its `cache` exposed.

```ts
type TMemoizeFn<Args extends any[], Return> = TFn<Args, Return> & { cache: Map<string, any>; }
```

Estende `any`.

---

## `TLazy`

tipo · [src/natives/function/types.ts:115](../../../src/natives/function/types.ts#L115)

A value, or a function that produces it when needed.

```ts
type TLazy<T> = (() => T) | T
```

---

## `TUpdateFn`

tipo · [src/natives/function/types.ts:118](../../../src/natives/function/types.ts#L118)

Receives the current value and returns the next one.

```ts
type TUpdateFn<T> = TFn<[value: T], T>
```

---

## `FunctionUtils`

classe · [src/natives/function/utils.ts:15](../../../src/natives/function/utils.ts#L15)

Function wrappers: rate limiting (debounce, throttle, once, step), binding, memoizing and currying.

```ts
class FunctionUtils
```

### Estáticos

#### `static thisAsParameter(fn: TFn): TFn`

Wraps `fn` so its `this` is passed as an explicit leading parameter instead of the calling context.

#### `static rebind<Applied extends any[], Rest extends any[], Return>( fn: TFn<[...Applied, ...Rest], Return>, thisArg: any, ...args: Applied ): TFn<Rest, Return>`

Binds `this` and leading arguments like `Function.prototype.bind`, keeping a reference to the original function.

#### `static debounce<Args extends any[]>( fn: TFn<Args>, delay: TLazy<number> ): TDebounceFn<Args>`

Delays calling `fn` until `delay` ms have passed with no further calls — each call reschedules with the latest arguments.

#### `static leadingDebounce<Args extends any[]>(fn: TFn<Args>, delay: number): TFn<Args, void>`

Runs on the first call, then ignores calls until `delay` ms pass without any.

#### `static throttle<Args extends any[]>( fn: TFn<Args, void>, interval: number = 50, options: TThrottleOptions = {} ): TThrottleFn<Args>`

Calls `fn` immediately, then ignores further calls until `interval` ms have passed.
With `trailing: true` the last ignored call is replayed when the interval ends, so the final value is never lost.

#### `static step<Args extends any[]>( fn: TFn<Args, void>, amount: number = 10, autoClear: boolean = true ): TStepFn<Args>`

Calls `fn` every `amount` calls (resetting the counter afterwards unless `autoClear` is `false`).

#### `static once<Args extends any[]>(fn: TFn<[...Args], void>): TOnceFn<Args>`

Calls `fn` at most once — every call after the first is a no-op until `clear()` resets it.

#### `static memoize<Args extends any[], Return>( fn: TFn<Args, Return>, keyResolver?: (...args: Args) => string ): TMemoizeFn<Args, Return>`

Caches results by arguments (by default `JSON.stringify(args)`; pass `keyResolver` for other keys).

#### `static curry(fn: TFn): TFn`

Collects arguments across calls until there are as many as `fn` declares, then calls it.

#### `static scheduleOnce(fn: () => void): TScheduleOnceFn`

Coalesces calls within the same microtask into a single `fn()` run. `clear()` cancels a pending run, `flush()` runs it immediately instead of waiting for the microtask.

#### `static toFunction<T>(value: TLazy<T>): () => T`

Turns a lazy value (`TLazy`) into a function: functions are returned as they are, plain values get wrapped.
