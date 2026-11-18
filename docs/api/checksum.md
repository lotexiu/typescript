# `checksum`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TDigitRule`](#tdigitrule) | tipo | Como o resto da divisão vira dígito verificador. - `complement-zero-below-2`: `resto < 2 ? 0 : módulo - resto` (variante comum do módulo 11) - `remainder-zero-above-9`: `resto > 9 ? 0 : resto` (variante do módulo 11) - `complement`: `(módulo - resto) % módulo` (Luhn, mod 10) - `remainder`: o próprio resto |
| [`TCharValue`](#tcharvalue) | tipo | Valor numérico de cada caractere: `digit` só aceita 0-9; `ascii-48` = código ASCII − 48 (dígitos 0-9; letras maiúsculas A=17, B=18, ...). |
| [`TWeightedSpec`](#tweightedspec) | tipo | Cálculo de dígito verificador por soma ponderada, descrito só com dados (portável para qualquer linguagem). |
| [`ChecksumUtils`](#checksumutils) | classe | Dígitos verificadores como dados + funções puras. Nada aqui conhece documento, país ou formato: quem descreve um documento é quem consome (um pacote de dados de região, ou o próprio app), passando um `TWeightedSpec`. Entradas inválidas devolvem `undefined`/`false` (erro como valor), nunca lançam. |

---

## `TDigitRule`

tipo · [src/checksum/types.ts:8](../../src/checksum/types.ts#L8)

Como o resto da divisão vira dígito verificador.
- `complement-zero-below-2`: `resto < 2 ? 0 : módulo - resto` (variante comum do módulo 11)
- `remainder-zero-above-9`: `resto > 9 ? 0 : resto` (variante do módulo 11)
- `complement`: `(módulo - resto) % módulo` (Luhn, mod 10)
- `remainder`: o próprio resto

```ts
type TDigitRule = 'complement-zero-below-2' | 'remainder-zero-above-9' | 'complement' | 'remainder'
```

---

## `TCharValue`

tipo · [src/checksum/types.ts:11](../../src/checksum/types.ts#L11)

Valor numérico de cada caractere: `digit` só aceita 0-9; `ascii-48` = código ASCII − 48 (dígitos 0-9; letras maiúsculas A=17, B=18, ...).

```ts
type TCharValue = 'digit' | 'ascii-48'
```

---

## `TWeightedSpec`

tipo · [src/checksum/types.ts:14](../../src/checksum/types.ts#L14)

Cálculo de dígito verificador por soma ponderada, descrito só com dados (portável para qualquer linguagem).

```ts
type TWeightedSpec = Readonly<{
	/** Um peso por caractere do texto, da esquerda para a direita. */
	weights: readonly number[];
	modulus: number;
	rule: TDigitRule;
	charValue?: TCharValue;
	/** Soma os algarismos de cada produto (`18 → 1+8`), como no IE-MG e no Luhn. */
	sumProductDigits?: boolean;
}>
```

---

## `ChecksumUtils`

classe · [src/checksum/utils.ts:9](../../src/checksum/utils.ts#L9)

Dígitos verificadores como dados + funções puras. Nada aqui conhece documento, país ou formato:
quem descreve um documento é quem consome (um pacote de dados de região, ou o próprio app), passando um `TWeightedSpec`.
Entradas inválidas devolvem `undefined`/`false` (erro como valor), nunca lançam.

```ts
class ChecksumUtils
```

### Estáticos

#### `static charValue(char: string, kind: TCharValue = 'digit'): number | undefined`

Valor numérico de um caractere, ou `undefined` se não vale para `kind`.

#### `static cyclicWeights(length: number, from: number, to: number): number[]`

Pesos `from..to` repetidos em ciclo, contados **da direita**, devolvidos da esquerda para a direita (módulo 11 clássico: `2..9`).

#### `static weightedSum(text: string, spec: TWeightedSpec): number | undefined`

Sum of each digit times its weight (`undefined` when a character is not a digit for the spec).

#### `static digit(text: string, spec: TWeightedSpec): number | undefined`

Dígito verificador de `text` (o corpo, **sem** o dígito), ou `undefined` se `text` não bate com `spec`.

#### `static applyRule(remainder: number, modulus: number, rule: TDigitRule): number`

Turns a remainder into a check digit with the given rule.

#### `static luhnDigit(body: string): number | undefined`

Dígito Luhn do corpo (sem o dígito).

#### `static luhnValid(full: string): boolean`

`true` se `full` (corpo + dígito) passa no Luhn (cartões, IMEI).

#### `static mod97(text: string): number | undefined`

Resto mod 97 de um texto alfanumérico em que letras valem 10-35 (A=10): é a conta do IBAN
(reordene país+dígitos para o fim antes; válido quando o resto é 1). Feito por partes — nunca estoura `number`.

#### `static allSame(text: string): boolean`

Todos os caracteres iguais (`111.111.111-11`)? Muitos documentos rejeitam isso mesmo com dígito certo.

#### `static digitSum(value: number): number`

Sum of the digits of a number (`18` → `9`).

#### `static luhnSum(text: string, doubleFirst: boolean): number | undefined`

`doubleFirst`: o caractere mais à direita é dobrado (cálculo do dígito a partir do corpo); senão o segundo (validação do número inteiro).
