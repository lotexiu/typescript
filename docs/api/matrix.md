# `matrix`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Matrix`](#matrix) | classe | An N-dimensional grid stored in one flat buffer (a plain array or a typed array), reactive to writes. |
| [`TMatrixBuffer`](#tmatrixbuffer) | tipo | The subset of the array API a matrix buffer must have (arrays and typed arrays fit). |
| [`TMatrixBufferCtor`](#tmatrixbufferctor) | tipo | Constructor of a buffer of a given length. |

---

## `Matrix`

classe · [src/matrix/model.ts:6](../../src/matrix/model.ts#L6)

An N-dimensional grid stored in one flat buffer (a plain array or a typed array), reactive to writes.

```ts
class Matrix<T>
```

### Construtor

#### `constructor(dimensions?: number[], dataClass?: TMatrixBufferCtor<T>, filledValue?: T)`

Creates the grid, optionally filled with `filledValue`.

### Propriedades

#### `readonly dimensions = signal<number[]>([128, 128]`

Size of each axis.

#### `readonly dataClass = signal<TMatrixBufferCtor<T>>(Array`

Buffer constructor (`Array`, `Float32Array`...).

#### `readonly size`

Total number of cells.

#### `readonly data`

The buffer; notifies on every `set`.

### Métodos

#### `get(...indexes: number[]): T`

Value at the given indexes (one per axis).

#### `set(value: T, ...indexes: number[]): void`

Writes a value at the given indexes.

#### `section(...indexes: number[]): TMatrixBuffer<T>`

Copy of the cells under the given leading indexes (a row, a plane...).

#### `toString(): string`

The grid as text, one row per line.

---

## `TMatrixBuffer`

tipo · [src/matrix/types.ts:2](../../src/matrix/types.ts#L2)

The subset of the array API a matrix buffer must have (arrays and typed arrays fit).

```ts
type TMatrixBuffer<T> = { … }
```

### Propriedades

#### `length: number`

Number of cells.

### Métodos

#### `slice(start?: number, end?: number): TMatrixBuffer<T>`

Copy of a range.

#### `fill(value: T, start?: number, end?: number): TMatrixBuffer<T>`

Fills a range.

#### `join(separator?: string): string`

Cells as text.

#### `reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U): U`

Folds the cells.

#### `map(callbackfn: (value: T, index: number) => T, thisArg?: any): TMatrixBuffer<T>`

Maps the cells.

#### `forEach(callbackfn: (value: T, index: number) => void, thisArg?: any): void`

Visits the cells.

---

## `TMatrixBufferCtor`

tipo · [src/matrix/types.ts:21](../../src/matrix/types.ts#L21)

Constructor of a buffer of a given length.

```ts
type TMatrixBufferCtor<T> = new (length: number) => TMatrixBuffer<T>
```
