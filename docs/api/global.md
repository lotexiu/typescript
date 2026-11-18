# `global`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TargetImpl`](#targetimpl) | tipo | The shape `_Global.register` expects: an optional function-valued override for each method of `T`'s instances (except `valueOf`). |
| [`GlobalUtils`](#globalutils) | classe | Installs methods on native prototypes (the `String`, `Function`... extensions of `src/declarations.ts`). |

---

## `TargetImpl`

tipo · [src/global/types.ts:5](../../src/global/types.ts#L5)

The shape `_Global.register` expects: an optional function-valued override for each method of `T`'s instances (except `valueOf`).

```ts
type TargetImpl<T extends TAbstractConstructor, I extends InstanceType<T> = InstanceType<T>> = { … }
```

Estende [`TAbstractConstructor`](natives/function.md#tabstractconstructor) — os membros herdados estão documentados lá.

---

## `GlobalUtils`

classe · [src/global/utils.ts:7](../../src/global/utils.ts#L7)

Installs methods on native prototypes (the `String`, `Function`... extensions of `src/declarations.ts`).

```ts
class GlobalUtils
```

### Estáticos

#### `static register<Target extends TAbstractConstructor>( target: Target, extension: TargetImpl<Target> )`

Defines every key of `extension` as a property directly on `target.prototype`.
