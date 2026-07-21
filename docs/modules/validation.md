[← Voltar para PROJECT.md](../PROJECT.md)

# validation

<a id="_Validation"></a>
#### [`_Validation`](../../src/validation/implementations.ts#L8) _(class)_

- `@internal` Checagens de validade puras e diretas — sem estado, sem "regra" em forma
de closure. Cada plugin que precisar validar algo chama a checagem que
fizer sentido pra ele diretamente e decide como reportar/reagir; não há
mais um mecanismo genérico de lista de regras por trás disso.

<a id="_Validation.required"></a>
- [`required`](../../src/validation/implementations.ts#L10)
  Verdadeiro pra qualquer valor "presente" — não vazio, não nulo, não undefined.
<a id="_Validation.pattern"></a>
- [`pattern`](../../src/validation/implementations.ts#L15)
  Whether `value` matches `regex`.
<a id="_Validation.isValidCPF"></a>
- [`isValidCPF`](../../src/validation/implementations.ts#L20)
  Valida dígitos verificadores de CPF. Aceita com ou sem máscara.
<a id="_Validation.isValidCNPJ"></a>
- [`isValidCNPJ`](../../src/validation/implementations.ts#L41)
  Valida dígitos verificadores de CNPJ. Aceita com ou sem máscara.

<a id="required"></a>
#### [`required`](../../src/validation/implementations.ts#L66) _(function)_

Verdadeiro pra qualquer valor "presente" — não vazio, não nulo, não undefined.

<a id="pattern"></a>
#### [`pattern`](../../src/validation/implementations.ts#L67) _(function)_

Whether `value` matches `regex`.

<a id="ValidationUtils"></a>
#### [`ValidationUtils`](../../src/validation/utils.ts#L4) _(class)_

Public static wrapper over `_Validation` — direct, stateless validity checks (presence, pattern, CPF/CNPJ checksum).

<a id="ValidationUtils.required"></a>
- [`required`](../../src/validation/utils.ts#L5)
  Verdadeiro pra qualquer valor "presente" — não vazio, não nulo, não undefined.
<a id="ValidationUtils.pattern"></a>
- [`pattern`](../../src/validation/utils.ts#L6)
  Whether `value` matches `regex`.
<a id="ValidationUtils.isValidCPF"></a>
- [`isValidCPF`](../../src/validation/utils.ts#L7)
  Valida dígitos verificadores de CPF. Aceita com ou sem máscara.
<a id="ValidationUtils.isValidCNPJ"></a>
- [`isValidCNPJ`](../../src/validation/utils.ts#L8)
  Valida dígitos verificadores de CNPJ. Aceita com ou sem máscara.
