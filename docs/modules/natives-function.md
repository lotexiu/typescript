[← Voltar para PROJECT.md](../PROJECT.md)

# natives/function

<a id="_Function"></a>
#### [`_Function`](../../src/natives/function/implementations.ts#L6) _(class)_

- `@internal`

<a id="_Function.thisAsParameter"></a>
- [`thisAsParameter`](../../src/natives/function/implementations.ts#L8)
  Wraps `fn` so its `this` is passed as an explicit leading parameter instead of the calling context.
<a id="_Function.negate"></a>
- [`negate`](../../src/natives/function/implementations.ts#L15)
  Wraps `fn` so it returns the boolean negation of its result.
<a id="_Function.rebind"></a>
- [`rebind`](../../src/natives/function/implementations.ts#L28)
  Cria uma nova função com `this` e argumentos pré-aplicados fixos.
Rebinding em cima de uma função já rebindada acumula os argumentos
(não empilha wrappers) — `fn.fn` sempre aponta pra função original.

<a id="TFnOption"></a>
#### [`TFnOption`](../../src/natives/function/types.ts#L3) _(type, type-only)_

<a id="TFn"></a>
#### [`TFn`](../../src/natives/function/types.ts#L10) _(type, type-only)_

Generic function-type shape, parameterized by argument list/inference target/return type — the base other function-type utilities here build on.

<a id="TFnDeclaration"></a>
#### [`TFnDeclaration`](../../src/natives/function/types.ts#L15) _(type, type-only)_

Rewrites a function type with a leading "this-like" parameter into a method declaration with an explicit `this: V` parameter (used to type `thisAsParameter`-wrapped functions).

<a id="R"></a>
#### [`R`](../../src/natives/function/types.ts#L20) _(type, type-only)_

<a id="R2"></a>
#### [`R2`](../../src/natives/function/types.ts#L22) _(type, type-only)_

<a id="TBindFnOption"></a>
#### [`TBindFnOption`](../../src/natives/function/types.ts#L35) _(type, type-only)_

<a id="TBindFn"></a>
#### [`TBindFn`](../../src/natives/function/types.ts#L42) _(type, type-only)_

Callable shape returned by `_Function.rebind` — carries the original `fn`, the bound `context`, and the accumulated `args` alongside the callable signature.

<a id="TModifyFnParameters"></a>
#### [`TModifyFnParameters`](../../src/natives/function/types.ts#L50) _(type, type-only)_

`Fn`'s type with its parameter list replaced by `Args`, keeping its original return type.

<a id="TModifyFnReturn"></a>
#### [`TModifyFnReturn`](../../src/natives/function/types.ts#L56) _(type, type-only)_

`Fn`'s type with its return type replaced by `ReturnType`, keeping its original parameters.

<a id="TParameters"></a>
#### [`TParameters`](../../src/natives/function/types.ts#L62) _(type, type-only)_

Extracts a function type's parameter tuple (tolerates non-function `T`, resolving to `never` instead of requiring `(...args: any) => any`).

<a id="TReturnType"></a>
#### [`TReturnType`](../../src/natives/function/types.ts#L65) _(type, type-only)_

Extracts a function type's return type — thin alias over the built-in `ReturnType`.

<a id="TConstructor"></a>
#### [`TConstructor`](../../src/natives/function/types.ts#L68) _(type, type-only)_

An abstract constructor type shape: `abstract new (...args: Args) => T`.

<a id="TConstructorInfo"></a>
#### [`TConstructorInfo`](../../src/natives/function/types.ts#L74) _(type, type-only)_

Splits a constructor type into its `{ instance, parameters }` shape.

<a id="TConstructorParameters"></a>
#### [`TConstructorParameters`](../../src/natives/function/types.ts#L80) _(type, type-only)_

Extracts a constructor type's parameter tuple.

<a id="TInstanceType"></a>
#### [`TInstanceType`](../../src/natives/function/types.ts#L86) _(type, type-only)_

Extracts a constructor type's instance type — thin alias over the built-in `InstanceType`.
