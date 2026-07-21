[← Voltar para PROJECT.md](../PROJECT.md)

# natives/number

<a id="_Number"></a>
#### [`_Number`](../../src/natives/number/implementations.ts#L4) _(class)_

- `@internal`

<a id="_Number.parse"></a>
- [`parse`](../../src/natives/number/implementations.ts#L6)
  Converte texto bruto em number, ou undefined se vazio/não numérico. Não julga validade de negócio.

<a id="TDigit"></a>
#### [`TDigit`](../../src/natives/number/types.ts#L2) _(type, type-only)_

A single decimal digit literal type, `0`-`9`.

<a id="TNumberTypes"></a>
#### [`TNumberTypes`](../../src/natives/number/types.ts#L4) _(type, type-only)_

<a id="TNumber"></a>
#### [`TNumber`](../../src/natives/number/types.ts#L7) _(type, type-only)_

Parses a numeric string/number literal type into its number literal type — `never` if `T` isn't numeric.

<a id="TAbs"></a>
#### [`TAbs`](../../src/natives/number/types.ts#L10) _(type, type-only)_

The absolute value of a numeric literal type, as a number literal type.

<a id="TNegative"></a>
#### [`TNegative`](../../src/natives/number/types.ts#L13) _(type, type-only)_

`T` itself if its literal value is negative, otherwise `never`.

<a id="TPositive"></a>
#### [`TPositive`](../../src/natives/number/types.ts#L16) _(type, type-only)_

`T` itself if its literal value is non-negative, otherwise `never`.

<a id="TNegate"></a>
#### [`TNegate`](../../src/natives/number/types.ts#L19) _(type, type-only)_

The arithmetic negation of a numeric literal type.

<a id="TDigitCompare"></a>
#### [`TDigitCompare`](../../src/natives/number/types.ts#L27) _(type, type-only)_

Compares two single-digit literal types: `-1` (`A < B`), `0` (equal), or `1` (`A > B`), via a static lookup table.

<a id="NumberUtils"></a>
#### [`NumberUtils`](../../src/natives/number/utils.ts#L4) _(class)_

Public static wrapper over `_Number` — raw-text-to-number parsing.

<a id="NumberUtils.parse"></a>
- [`parse`](../../src/natives/number/utils.ts#L5)
  Converte texto bruto em number, ou undefined se vazio/não numérico. Não julga validade de negócio.
