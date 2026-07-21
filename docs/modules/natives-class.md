[← Voltar para PROJECT.md](../PROJECT.md)

# natives/class

<a id="Timeout"></a>
#### [`Timeout`](../../src/natives/class/declarations.ts#L4) _(type)_

The real `NodeJS.Timeout` type/value pair — Node doesn't expose this constructor directly, so it's recovered from a throwaway `setTimeout` call.

<a id="Timeout"></a>
#### [`Timeout`](../../src/natives/class/declarations.ts#L6) _(const)_

The real `NodeJS.Timeout` type/value pair — Node doesn't expose this constructor directly, so it's recovered from a throwaway `setTimeout` call.

<a id="instanceOf"></a>
#### [`instanceOf`](../../src/natives/class/implementations.ts#L5) _(function)_

Type-safe `instanceof` check — narrows `obj` to `T` when it's an instance of `constructor`.

<a id="TPrototype"></a>
#### [`TPrototype`](../../src/natives/class/types.ts#L4) _(type, type-only)_

The shape of an object exposing a `constructor: TConstructor<T>`.

<a id="TClazz"></a>
#### [`TClazz`](../../src/natives/class/types.ts#L9) _(type, type-only)_

A constructable, class-like type — `TConstructor<T>` intersected with `Function`/`NewableFunction`.

<a id="TExtendClass"></a>
#### [`TExtendClass`](../../src/natives/class/types.ts#L14) _(type, type-only)_

`TClazz<T>`, optionally merged with `E`'s shape — for typing subclassing/mixin-style extension.

<a id="TTimeout"></a>
#### [`TTimeout`](../../src/natives/class/types.ts#L19) _(type, type-only)_

The constructor type of Node's `NodeJS.Timeout`.
