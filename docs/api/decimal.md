# `decimal`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Decimal`](#decimal) | classe | Número decimal **exato** (inteiro grande + escala): `0.1 + 0.2` dá `0.3`. Imutável, sem dependências, sem `Number` no meio. A escala é a quantidade de casas e é preservada (`1.50` continua `1.50`); `+`, `−`, `×` são exatos, e só `divide`/`toScale` arredondam — sempre com o modo explícito. Para dinheiro: `Decimal.fromMinor(1999n, 2)` = `19.99`, `toMinor(2)` volta a `1999n`. Sem moeda, locale ou imposto: isso é de quem usa. |
| [`TRoundingMode`](#troundingmode) | tipo | Como arredondar quando o resultado não cabe na escala pedida: `up` = para longe do zero · `down` = para o zero (trunca) · `ceil` = para +∞ · `floor` = para −∞ · `half-up` = meio vai para longe do zero (o "arredonda normal") · `half-down` = meio vai para o zero · `half-even` = meio vai para o par (bancário). |
| [`TDecimalInput`](#tdecimalinput) | tipo | Anything a `Decimal` operation accepts; numbers go through their shortest decimal text. |
| [`DecimalUtils`](#decimalutils) | classe | Aritmética de `bigint` por trás do `Decimal` (não conhece `Decimal`). |

---

## `Decimal`

classe · [src/decimal/model.ts:11](../../src/decimal/model.ts#L11)

Número decimal **exato** (inteiro grande + escala): `0.1 + 0.2` dá `0.3`. Imutável, sem dependências, sem `Number` no meio.
A escala é a quantidade de casas e é preservada (`1.50` continua `1.50`); `+`, `−`, `×` são exatos, e só `divide`/`toScale`
arredondam — sempre com o modo explícito. Para dinheiro: `Decimal.fromMinor(1999n, 2)` = `19.99`, `toMinor(2)` volta a `1999n`.
Sem moeda, locale ou imposto: isso é de quem usa.

```ts
class Decimal
```

### Estáticos

#### `static tryParse(text: string): Decimal | undefined`

`undefined` se o texto não é um decimal (`'1,5'`, `'abc'`, `'1.'`). Aceita sinal e expoente (`'-1.5e3'`).

#### `static parse(text: string): Decimal`

Reads decimal text (`-12.5`, `1e3`); throws `RangeError` for anything else.

#### `static from(input: TDecimalInput): Decimal`

Número JS só se for finito (e então vale o que o JS imprime: `from(0.1)` = `0.1`); bigint vira inteiro.

#### `static fromMinor(minor: bigint, scale: number): Decimal`

Unidades menores → decimal: `fromMinor(1999n, 2)` = `19.99`.

#### `static sum(items: Iterable<TDecimalInput>): Decimal`

Exact sum of the items.

#### `static allocate(total: TDecimalInput, weights: readonly TDecimalInput[], scale: number): Decimal[]`

Reparte `total` em partes proporcionais a `weights` com `scale` casas **sem perder nem criar centavos**:
a soma das partes é exatamente `total` (arredondado à escala). O resto vai, uma unidade por vez, para as primeiras partes.

#### `static compare(left: TDecimalInput, right: TDecimalInput): -1 | 0 | 1`

-1, 0 or 1, like a sort comparator.

### Propriedades

#### `get sign(): -1 | 0 | 1`

-1, 0 or 1.

#### `get isZero(): boolean`

Whether the value is zero.

### Métodos

#### `add(other: TDecimalInput): Decimal`

Exact sum.

#### `subtract(other: TDecimalInput): Decimal`

Exact difference.

#### `multiply(other: TDecimalInput): Decimal`

Exato: a escala do resultado é a soma das escalas.

#### `divide(other: TDecimalInput, scale: number, mode: TRoundingMode = 'half-up'): Decimal`

Divide e arredonda para `scale` casas. A escala e o modo são **explícitos** (dividir não é exato).

#### `remainder(other: TDecimalInput): Decimal`

Resto da divisão com o sinal do dividendo (como `%`).

#### `pow(exponent: number): Decimal`

Inteiro não negativo: `Decimal` exato (a escala cresce).

#### `toScale(scale: number, mode: TRoundingMode = 'half-up'): Decimal`

Passa para exatamente `scale` casas: completa com zeros ou arredonda pelo `mode`.

#### `strip(): Decimal`

Tira zeros à direita (`1.500` → `1.5`; `100` fica `100`).

#### `negate(): Decimal`

Opposite sign.

#### `abs(): Decimal`

Absolute value.

#### `equals(other: TDecimalInput): boolean`

Mesmo valor (`1.0` equals `1.00`).

#### `lessThan(other: TDecimalInput): boolean`

Whether this is smaller.

#### `greaterThan(other: TDecimalInput): boolean`

Whether this is larger.

#### `toMinor(scale: number = this.scale, mode: TRoundingMode = 'half-up'): bigint`

Unidades menores na `scale` pedida (`19.99` → `1999n` com 2); arredonda se precisar.

#### `toNumber(): number`

Nearest JavaScript number (may lose precision).

#### `toString(): string`

Texto fixo, sem expoente, com todas as casas da escala.

#### `toFixed(scale: number, mode: TRoundingMode = 'half-up'): string`

Text with exactly `scale` decimal places, rounded with `mode`.

#### `toJSON(): string`

Same as `toString`, so it survives JSON without precision loss.

---

## `TRoundingMode`

tipo · [src/decimal/types.ts:8](../../src/decimal/types.ts#L8)

Como arredondar quando o resultado não cabe na escala pedida:
`up` = para longe do zero · `down` = para o zero (trunca) · `ceil` = para +∞ · `floor` = para −∞ ·
`half-up` = meio vai para longe do zero (o "arredonda normal") · `half-down` = meio vai para o zero · `half-even` = meio vai para o par (bancário).

```ts
type TRoundingMode = 'up' | 'down' | 'ceil' | 'floor' | 'half-up' | 'half-down' | 'half-even'
```

---

## `TDecimalInput`

tipo · [src/decimal/types.ts:11](../../src/decimal/types.ts#L11)

Anything a `Decimal` operation accepts; numbers go through their shortest decimal text.

```ts
type TDecimalInput = Decimal | string | number | bigint
```

---

## `DecimalUtils`

classe · [src/decimal/utils.ts:5](../../src/decimal/utils.ts#L5)

Aritmética de `bigint` por trás do `Decimal` (não conhece `Decimal`).

```ts
class DecimalUtils
```

### Estáticos

#### `static pow10(exponent: number): bigint`

10 to the power of `exponent`, as a bigint.

#### `static abs(value: bigint): bigint`

Absolute value of a bigint.

#### `static divideRounded(numerator: bigint, denominator: bigint, mode: TRoundingMode): bigint`

Divide `numerator / denominator` (inteiros) e arredonda o quociente pelo `mode`.
