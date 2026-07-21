[← Voltar para PROJECT.md](../PROJECT.md)

# path-map

<a id="PathMap"></a>
#### [`PathMap`](../../src/path-map/model.ts#L4) _(class)_

A tree of nested `Map`s keyed by a tuple path `P`, storing a bucket of `T` values at each leaf path.

<a id="last"></a>
#### [`last`](../../src/path-map/model.ts#L8) _(const)_

<a id="current"></a>
#### [`current`](../../src/path-map/model.ts#L9) _(const)_

<a id="stack"></a>
#### [`stack`](../../src/path-map/model.ts#L25) _(const)_

<a id="current"></a>
#### [`current`](../../src/path-map/model.ts#L26) _(const)_

<a id="values"></a>
#### [`values`](../../src/path-map/model.ts#L35) _(const)_

<a id="index"></a>
#### [`index`](../../src/path-map/model.ts#L36) _(const)_

<a id="{ parent, key }"></a>
#### [`{ parent, key }`](../../src/path-map/model.ts#L41) _(const)_

<a id="target"></a>
#### [`target`](../../src/path-map/model.ts#L42) _(const)_

<a id="isEmpty"></a>
#### [`isEmpty`](../../src/path-map/model.ts#L44) _(const)_

<a id="current"></a>
#### [`current`](../../src/path-map/model.ts#L57) _(const)_

<a id="TRecursiveMap"></a>
#### [`TRecursiveMap`](../../src/path-map/types.ts#L2) _(type, type-only)_

A `Map` nested one level per element of tuple `P`, bottoming out in a `T[]` bucket — the shape `PathMap`'s `root` follows.
