[← Voltar para PROJECT.md](../PROJECT.md)

# global

<a id="_Global"></a>
#### [`_Global`](../../src/global/implementations.ts#L8) _(class)_

- `@internal`

<a id="TargetImpl"></a>
#### [`TargetImpl`](../../src/global/types.ts#L5) _(type, type-only)_

The shape `_Global.register` expects: an optional function-valued override for each method of `T`'s instances (except `valueOf`).

<a id="GlobalUtils"></a>
#### [`GlobalUtils`](../../src/global/utils.ts#L4) _(class)_

Public static wrapper over `_Global` — registers method overrides directly onto a native prototype (e.g. `String.prototype`).
