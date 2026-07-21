[← Voltar para PROJECT.md](../PROJECT.md)

# natives/class

<a id="Timeout"></a>
#### [`Timeout`](../../src/natives/class/declarations.ts#L4) _(type)_

The real `NodeJS.Timeout` type/value pair — Node doesn't expose this constructor directly, so it's recovered from a throwaway `setTimeout` call.

<a id="Timeout"></a>
#### [`Timeout`](../../src/natives/class/declarations.ts#L6) _(const)_

The real `NodeJS.Timeout` type/value pair — Node doesn't expose this constructor directly, so it's recovered from a throwaway `setTimeout` call.

<a id="_Class"></a>
#### [`_Class`](../../src/natives/class/implementations.ts#L6) _(class)_

- `@internal`

<a id="_Class.instanceOf"></a>
- [`instanceOf`](../../src/natives/class/implementations.ts#L8)
  Type-safe `instanceof` check — narrows `obj` to `T` when it's an instance of `constructor`.

<a id="instanceOf"></a>
#### [`instanceOf`](../../src/natives/class/implementations.ts#L14) _(function)_

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

<a id="ClassUtils"></a>
#### [`ClassUtils`](../../src/natives/class/utils.ts#L4) _(class)_

Public static wrapper over `_Class` — instance/constructor type-narrowing check.

<a id="ClassUtils.instanceOf"></a>
- [`instanceOf`](../../src/natives/class/utils.ts#L5)
  Type-safe `instanceof` check — narrows `obj` to `T` when it's an instance of `constructor`.
