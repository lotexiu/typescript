[← Voltar para PROJECT.md](../PROJECT.md)

# path-map

<a id="PathMap"></a>
#### [`PathMap`](../../src/path-map/model.ts#L4) _(class)_

A tree of nested `Map`s keyed by a tuple path `P`, storing a bucket of `T` values at each leaf path.

<a id="PathMap.root"></a>
- [`root`](../../src/path-map/model.ts#L6)
  The underlying nested-`Map` tree, keyed one level per path segment.
<a id="PathMap.add"></a>
- [`add`](../../src/path-map/model.ts#L9)
  Appends `values` to the bucket at `path`, creating intermediate maps as needed.
<a id="PathMap.remove"></a>
- [`remove`](../../src/path-map/model.ts#L27)
  Removes `value` from the bucket at `path`, pruning any intermediate maps left empty.
<a id="PathMap.get"></a>
- [`get`](../../src/path-map/model.ts#L60)
  Returns the bucket of values at `path`, or `[]` if the path doesn't exist.

<a id="TRecursiveMap"></a>
#### [`TRecursiveMap`](../../src/path-map/types.ts#L2) _(type, type-only)_

A `Map` nested one level per element of tuple `P`, bottoming out in a `T[]` bucket — the shape `PathMap`'s `root` follows.
