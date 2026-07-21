[← Voltar para PROJECT.md](../PROJECT.md)

# natives/validation

<a id="_Validation"></a>
#### [`_Validation`](../../src/natives/validation/implementations.ts#L8) _(class)_

- `@internal` Checagens de validade puras e diretas — sem estado, sem "regra" em forma
de closure. Cada plugin que precisar validar algo chama a checagem que
fizer sentido pra ele diretamente e decide como reportar/reagir; não há
mais um mecanismo genérico de lista de regras por trás disso.

<a id="digits"></a>
#### [`digits`](../../src/natives/validation/implementations.ts#L21) _(const)_

<a id="checkDigit"></a>
#### [`checkDigit`](../../src/natives/validation/implementations.ts#L25) _(const)_

<a id="sum"></a>
#### [`sum`](../../src/natives/validation/implementations.ts#L26) _(const)_

<a id="weightStart"></a>
#### [`weightStart`](../../src/natives/validation/implementations.ts#L27) _(const)_

<a id="remainder"></a>
#### [`remainder`](../../src/natives/validation/implementations.ts#L31) _(const)_

<a id="digits"></a>
#### [`digits`](../../src/natives/validation/implementations.ts#L42) _(const)_

<a id="checkDigit"></a>
#### [`checkDigit`](../../src/natives/validation/implementations.ts#L46) _(const)_

<a id="sum"></a>
#### [`sum`](../../src/natives/validation/implementations.ts#L47) _(const)_

<a id="remainder"></a>
#### [`remainder`](../../src/natives/validation/implementations.ts#L51) _(const)_

<a id="firstWeights"></a>
#### [`firstWeights`](../../src/natives/validation/implementations.ts#L55) _(const)_

<a id="secondWeights"></a>
#### [`secondWeights`](../../src/natives/validation/implementations.ts#L58) _(const)_

<a id="required"></a>
#### [`required`](../../src/natives/validation/implementations.ts#L66) _(const)_

Verdadeiro pra qualquer valor "presente" — não vazio, não nulo, não undefined.

<a id="pattern"></a>
#### [`pattern`](../../src/natives/validation/implementations.ts#L68) _(const)_

Whether `value` matches `regex`.

<a id="isValidCPF"></a>
#### [`isValidCPF`](../../src/natives/validation/implementations.ts#L70) _(const)_

Valida dígitos verificadores de CPF. Aceita com ou sem máscara.

<a id="isValidCNPJ"></a>
#### [`isValidCNPJ`](../../src/natives/validation/implementations.ts#L72) _(const)_

Valida dígitos verificadores de CNPJ. Aceita com ou sem máscara.

<a id="ValidationUtils"></a>
#### [`ValidationUtils`](../../src/natives/validation/utils.ts#L4) _(class)_

Public static wrapper over `_Validation` — direct, stateless validity checks (presence, pattern, CPF/CNPJ checksum).
