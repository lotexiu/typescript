# `natives/number`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`NUMBER_LOCALES`](#number_locales) | constante | Messages of the errors thrown by `NumberUtils`. |
| [`TDigit`](#tdigit) | tipo | A single decimal digit literal type, `0`-`9`. |
| [`TNumber`](#tnumber) | tipo | Parses a numeric string/number literal type into its number literal type — `never` if `T` isn't numeric. |
| [`TAbs`](#tabs) | tipo | The absolute value of a numeric literal type, as a number literal type. |
| [`TNegative`](#tnegative) | tipo | `T` itself if its literal value is negative, otherwise `never`. |
| [`TPositive`](#tpositive) | tipo | `T` itself if its literal value is non-negative, otherwise `never`. |
| [`TNegate`](#tnegate) | tipo | The arithmetic negation of a numeric literal type. |
| [`TDigitCompare`](#tdigitcompare) | tipo | Compares two single-digit literal types: `-1` (`A < B`), `0` (equal), or `1` (`A > B`), via a static lookup table. |
| [`NumberUtils`](#numberutils) | classe | Helpers about the decimal part of numbers — e.g. to scale them to integers before exact arithmetic. |

---

## `NUMBER_LOCALES`

constante · [src/natives/number/locale.ts:4](../../../src/natives/number/locale.ts#L4)

Messages of the errors thrown by `NumberUtils`.

```ts
const NUMBER_LOCALES
```

### Estáticos

#### `"en-US": { finite: 'Value must be finite', range: 'Value must be in range', invalid: 'Invalid value', notNan: 'Value cant be NaN', }`

#### `"pt-BR": { finite: 'O valor deve ser finito', range: 'O valor deve estar no intervalo', invalid: 'Valor inválido', notNan: 'O valor não pode ser NaN', }`

---

## `TDigit`

tipo · [src/natives/number/types.ts:2](../../../src/natives/number/types.ts#L2)

A single decimal digit literal type, `0`-`9`.

```ts
type TDigit = 0|1|2|3|4|5|6|7|8|9
```

---

## `TNumber`

tipo · [src/natives/number/types.ts:7](../../../src/natives/number/types.ts#L7)

Parses a numeric string/number literal type into its number literal type — `never` if `T` isn't numeric.

```ts
type TNumber<T extends TNumberTypes> = `${T}` extends `${infer R extends number}` ? R : never
```

Estende `TNumberTypes`.

---

## `TAbs`

tipo · [src/natives/number/types.ts:10](../../../src/natives/number/types.ts#L10)

The absolute value of a numeric literal type, as a number literal type.

```ts
type TAbs<T extends TNumberTypes> = `${T}` extends `-${infer R extends number}` ? R : TNumber<T>
```

Estende `TNumberTypes`.

---

## `TNegative`

tipo · [src/natives/number/types.ts:13](../../../src/natives/number/types.ts#L13)

`T` itself if its literal value is negative, otherwise `never`.

```ts
type TNegative<T extends TNumberTypes> = `${T}` extends `-${number}` ? T : never
```

Estende `TNumberTypes`.

---

## `TPositive`

tipo · [src/natives/number/types.ts:16](../../../src/natives/number/types.ts#L16)

`T` itself if its literal value is non-negative, otherwise `never`.

```ts
type TPositive<T extends TNumberTypes> = `${T}` extends `-${number}` ? never : T
```

Estende `TNumberTypes`.

---

## `TNegate`

tipo · [src/natives/number/types.ts:19](../../../src/natives/number/types.ts#L19)

The arithmetic negation of a numeric literal type.

```ts
type TNegate<T extends TNumberTypes> =
TAbs<T> extends infer R
	? R extends TNumber<T>
		? TNumber<`-${R}`>
		: R
	: never
```

Estende `TNumberTypes`.

---

## `TDigitCompare`

tipo · [src/natives/number/types.ts:27](../../../src/natives/number/types.ts#L27)

Compares two single-digit literal types: `-1` (`A < B`), `0` (equal), or `1` (`A > B`), via a static lookup table.

```ts
type TDigitCompare<
  A extends TDigit,
  B extends TDigit
> = [
// 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
	[0,-1,-1,-1,-1,-1,-1,-1,-1,-1], // 0
	[1, 0,-1,-1,-1,-1,-1,-1,-1,-1], // 1
	[1, 1, 0,-1,-1,-1,-1,-1,-1,-1], // 2
	[1, 1, 1, 0,-1,-1,-1,-1,-1,-1], // 3
	[1, 1, 1, 1, 0,-1,-1,-1,-1,-1], // 4
	[1, 1, 1, 1, 1, 0,-1,-1,-1,-1], // 5
	[1, 1, 1, 1, 1, 1, 0,-1,-1,-1], // 6
	[1, 1, 1, 1, 1, 1, 1, 0,-1,-1], // 7
	[1, 1, 1, 1, 1, 1, 1, 1, 0,-1], // 8
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 0], // 9
][A][B]
```

Estende [`TDigit`](number.md#tdigit) — os membros herdados estão documentados lá.

---

## `NumberUtils`

classe · [src/natives/number/utils.ts:5](../../../src/natives/number/utils.ts#L5)

Helpers about the decimal part of numbers — e.g. to scale them to integers before exact arithmetic.

```ts
class NumberUtils
```

### Estáticos

#### `static assertFinite(value: number): asserts value is number`

Throws `LocaleError` (`finite`) for `NaN` and infinities.

#### `static hasDecimals(value: number): boolean`

Whether the number has a fractional part.

#### `static getDecimals(value: number): number`

The fractional part, always positive (`-1.25` → `0.25`).

#### `static getScaleToInt(value: number): number`

Power of ten that turns the number into an integer (`1.25` → `100`).

#### `static scaleToInt(value: number): number`

The number multiplied by `getScaleToInt`.

#### `static decimalsLength(value: number): number`

How many decimal places the number has, exponent notation included (`1.5e-3` → 4).
