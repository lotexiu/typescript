[← Voltar para PROJECT.md](../PROJECT.md)

# (root)

<a id="String"></a>
#### [`String`](../../src/declarations.ts#L29) _(interface)_

<a id="Function"></a>
#### [`Function`](../../src/declarations.ts#L42) _(interface)_

<a id="_typeof"></a>
#### [`_typeof`](../../src/types.ts#L1) _(const)_

<a id="TTypeOfValue"></a>
#### [`TTypeOfValue`](../../src/types.ts#L4) _(type, type-only)_

The literal union of every possible result of the `typeof` operator (`"string"`, `"number"`, etc).

<a id="TNullable"></a>
#### [`TNullable`](../../src/types.ts#L7) _(type, type-only)_

`Type` widened with `undefined`/`null` (and `void`, unless `NoVoid` is `true`).

<a id="TNotUndefined"></a>
#### [`TNotUndefined`](../../src/types.ts#L15) _(type, type-only)_

`T` with `undefined` excluded from the union.

<a id="TAs"></a>
#### [`TAs`](../../src/types.ts#L18) _(type, type-only)_

`T` narrowed/cast to `T & U` when `T` is assignable to `U`, otherwise `never`.

<a id="TUnkown"></a>
#### [`TUnkown`](../../src/types.ts#L21) _(type, type-only)_

`T` itself if it has no known keys (e.g. `unknown`, `{}`), otherwise `never`.

<a id="TSameType"></a>
#### [`TSameType`](../../src/types.ts#L24) _(type, type-only)_

`A` if `A` and `B` are structurally identical (mutually assignable), otherwise `never`.
