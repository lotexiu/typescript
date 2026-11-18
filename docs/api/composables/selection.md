# `composables/selection`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Selection`](#selection) | tipo | A reactive set of selected values, read as an array. |
| [`Selection`](#selection) | constante | Methods shared by every instance (assigned to each one) and the `instanceof` check. |
| [`selection`](#selection) | função | Creates a `Selection`, optionally with initial values. |

---

## `Selection`

tipo · [src/composables/selection/model.ts:7](../../../src/composables/selection/model.ts#L7)

A reactive set of selected values, read as an array.

```ts
type Selection<T> = Computed<T[]> & {
	/** Number of selected values. */
	size: Computed<number>;
	isEmpty: Computed<boolean>;
	has: (...values: T[]) => boolean;
	/** Replaces the whole selection (a single notification). */
	set: (values: Iterable<T>) => void;
	select: (...values: T[]) => void;
	deselect: (...values: T[]) => void;
	toggle: (...values: T[]) => void;
	clear: () => void;
}
```

---

## `Selection`

constante · [src/composables/selection/model.ts:20](../../../src/composables/selection/model.ts#L20)

Methods shared by every instance (assigned to each one) and the `instanceof` check.

```ts
const Selection
```

---

## `selection`

função · [src/composables/selection/model.ts:68](../../../src/composables/selection/model.ts#L68)

Creates a `Selection`, optionally with initial values.

```ts
function selection<T>(initial: Iterable<T> = []): Selection<T>
```
