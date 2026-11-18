# `natives/class`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Timeout`](#timeout) | tipo | The real `NodeJS.Timeout` type/value pair — Node doesn't expose this constructor directly, so it's recovered from a throwaway `setTimeout` call. |
| [`Timeout`](#timeout) | constante | The real `NodeJS.Timeout` type/value pair — Node doesn't expose this constructor directly, so it's recovered from a throwaway `setTimeout` call. |
| [`TPrototype`](#tprototype) | tipo | The shape of an object exposing a `constructor: TConstructor<T>`. |
| [`TClazz`](#tclazz) | tipo | A constructable, class-like type — `TConstructor<T>` intersected with `Function`/`NewableFunction`. |
| [`TExtendClass`](#textendclass) | tipo | `TClazz<T>`, optionally merged with `E`'s shape — for typing subclassing/mixin-style extension. |
| [`TTimeout`](#ttimeout) | tipo | The constructor type of Node's `NodeJS.Timeout`. |
| [`ClassUtils`](#classutils) | classe | Reflection over classes and instances: prototype chains, method names, mixins, cloning and binding. |

---

## `Timeout`

tipo · [src/natives/class/declarations.ts:4](../../../src/natives/class/declarations.ts#L4)

The real `NodeJS.Timeout` type/value pair — Node doesn't expose this constructor directly, so it's recovered from a throwaway `setTimeout` call.

```ts
type Timeout = NodeJS.Timeout
```

---

## `Timeout`

constante · [src/natives/class/declarations.ts:6](../../../src/natives/class/declarations.ts#L6)

The real `NodeJS.Timeout` type/value pair — Node doesn't expose this constructor directly, so it's recovered from a throwaway `setTimeout` call.

```ts
const Timeout = setTimeout(()=>{}).constructor as TTimeout
```

---

## `TPrototype`

tipo · [src/natives/class/types.ts:4](../../../src/natives/class/types.ts#L4)

The shape of an object exposing a `constructor: TConstructor<T>`.

```ts
type TPrototype<T> = { … }
```

### Propriedades

#### `constructor: TAbstractConstructor<T>`

The class that created the object.

---

## `TClazz`

tipo · [src/natives/class/types.ts:10](../../../src/natives/class/types.ts#L10)

A constructable, class-like type — `TConstructor<T>` intersected with `Function`/`NewableFunction`.

```ts
type TClazz<T = null> = T extends null
? TAbstractConstructor<any> & Function & NewableFunction
: TAbstractConstructor<T> & Function & NewableFunction
```

Estende `null`.

---

## `TExtendClass`

tipo · [src/natives/class/types.ts:15](../../../src/natives/class/types.ts#L15)

`TClazz<T>`, optionally merged with `E`'s shape — for typing subclassing/mixin-style extension.

```ts
type TExtendClass<T, E> = E extends null ? TClazz<T> : TClazz<T&E>
```

Estende `null`.

---

## `TTimeout`

tipo · [src/natives/class/types.ts:20](../../../src/natives/class/types.ts#L20)

The constructor type of Node's `NodeJS.Timeout`.

```ts
type TTimeout = TAbstractConstructor<NodeJS.Timeout>
```

---

## `ClassUtils`

classe · [src/natives/class/utils.ts:5](../../../src/natives/class/utils.ts#L5)

Reflection over classes and instances: prototype chains, method names, mixins, cloning and binding.

```ts
class ClassUtils
```

### Estáticos

#### `static getPrototypeChain(target: object | TConstructor): object[]`

Prototypes from the object (or class prototype) up to, not including, `Object.prototype`.

#### `static getMethodNames<T extends object>(target: T | TConstructor): TMethodKey<T>[]`

Names of every method along the prototype chain, without the constructor and accessors.

#### `static getAccessors(target: object | TConstructor): { getters: string[]; setters: string[] }`

Names of the getters and setters along the prototype chain.

#### `static isSubclassOf<T extends TAbstractConstructor>( target: TAbstractConstructor, superClass: T ): boolean`

Whether `child` extends `parent`, directly or not.

#### `static instantiateUninitialized<T extends object>(ctor: TConstructor<T>): T`

An object with the class prototype but without running the constructor.

#### `static cloneInstance<T extends object>(instance: T): T`

A shallow copy keeping the prototype (methods keep working).

#### `static applyMixins(derivedCtor: TConstructor, baseCtors: TConstructor[]): void`

Copies the methods and accessors of `baseCtors` onto `derivedCtor`'s prototype.

#### `static autoBind<T extends object>(instance: T): T`

Binds every method to the instance, so they survive being passed around unbound. Returns the instance.
