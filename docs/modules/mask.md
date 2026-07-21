[← Voltar para PROJECT.md](../PROJECT.md)

# mask

<a id="TMaskRule"></a>
#### [`TMaskRule`](../../src/mask/implementations.ts#L12) _(type, type-only)_

<a id="DEFAULT_MASK_RULES"></a>
#### [`DEFAULT_MASK_RULES`](../../src/mask/implementations.ts#L16) _(const)_

<a id="dynamicMaskRules"></a>
#### [`dynamicMaskRules`](../../src/mask/implementations.ts#L25) _(const)_

<a id="ruleSetVersion"></a>
#### [`ruleSetVersion`](../../src/mask/implementations.ts#L26) _(const)_

<a id="compileCache"></a>
#### [`compileCache`](../../src/mask/implementations.ts#L27) _(const)_

<a id="clearCompileCache"></a>
#### [`clearCompileCache`](../../src/mask/implementations.ts#L29) _(function)_

<a id="resolveMaskRule"></a>
#### [`resolveMaskRule`](../../src/mask/implementations.ts#L33) _(function)_

<a id="tokenFromRule"></a>
#### [`tokenFromRule`](../../src/mask/implementations.ts#L37) _(function)_

<a id="registerToken"></a>
#### [`registerToken`](../../src/mask/implementations.ts#L48) _(function)_

Registers a custom mask token character (must be a single, non-reserved character).

<a id="unregisterToken"></a>
#### [`unregisterToken`](../../src/mask/implementations.ts#L63) _(function)_

Removes a previously registered custom mask token. Returns whether it existed.

<a id="getTokenKeys"></a>
#### [`getTokenKeys`](../../src/mask/implementations.ts#L75) _(function)_

Every registered mask token key — built-in and custom.

<a id="splitPatterns"></a>
#### [`splitPatterns`](../../src/mask/implementations.ts#L83) _(function)_

<a id="compilePattern"></a>
#### [`compilePattern`](../../src/mask/implementations.ts#L116) _(function)_

<a id="compile"></a>
#### [`compile`](../../src/mask/implementations.ts#L187) _(function)_

Compiles a mask pattern string (`||`-separated alternatives) into a reusable, cached `TMaskCompiled`.

<a id="matchToken"></a>
#### [`matchToken`](../../src/mask/implementations.ts#L202) _(function)_

<a id="unapplyFromPattern"></a>
#### [`unapplyFromPattern`](../../src/mask/implementations.ts#L208) _(function)_

<a id="unapply"></a>
#### [`unapply`](../../src/mask/implementations.ts#L238) _(function)_

Strips a masked `value` back down to its raw (token-matching-only) characters.

<a id="applyFromPattern"></a>
#### [`applyFromPattern`](../../src/mask/implementations.ts#L252) _(function)_

<a id="apply"></a>
#### [`apply`](../../src/mask/implementations.ts#L314) _(function)_

Formats `value` (raw or already-masked) against `mask`, picking whichever pattern alternative scores best.

<a id="isValid"></a>
#### [`isValid`](../../src/mask/implementations.ts#L351) _(function)_

Whether `value` (masked or raw) fully satisfies at least one alternative of `mask`.

<a id="caretPositionAfterFormat"></a>
#### [`caretPositionAfterFormat`](../../src/mask/implementations.ts#L433) _(function)_

Depois de reformatar um valor mascarado (ex.: usuário digitou no meio de
"111.444.777-35"), o caret pode ficar em qualquer posição do texto novo —
não reimplementa o parsing do pattern: conta quantos caracteres "raw"
(via `unapply`, já existente) ficam antes do caret no texto anterior, e
acha a posição no texto novo onde essa mesma contagem é atingida. Quando
a posição cai numa sequência de literais (ex.: logo depois de um "."), o
caret avança até o próximo caractere preenchível — não fica preso entre
literais.

<a id="_Mask"></a>
#### [`_Mask`](../../src/mask/implementations.ts#L452) _(const)_

- `@internal`

<a id="TUtilsMask"></a>
#### [`TUtilsMask`](../../src/mask/implementations.ts#L464) _(type, type-only)_

The static shape of the internal `_Mask` implementation — used to type `MaskUtils`.

<a id="TMaskTokenKind"></a>
#### [`TMaskTokenKind`](../../src/mask/types.ts#L2) _(type, type-only)_

The named character class a mask token matches (`digit`, `letter`, ...), or a custom key registered via `MaskUtils.registerToken`.

<a id="TMaskTokenMatcher"></a>
#### [`TMaskTokenMatcher`](../../src/mask/types.ts#L12) _(type, type-only)_

Predicate a mask token uses to test whether a single character matches it.

<a id="TMaskTokenRule"></a>
#### [`TMaskTokenRule`](../../src/mask/types.ts#L15) _(type, type-only)_

A registered mask token: its named kind (for display/diagnostics) and the matcher it validates characters against.

<a id="TMaskParserEntry"></a>
#### [`TMaskParserEntry`](../../src/mask/types.ts#L21) _(type, type-only)_

One parsed element of a compiled mask pattern — either a literal character to insert as-is, or a token slot with a min/max repeat count.

<a id="TMaskCompiledPattern"></a>
#### [`TMaskCompiledPattern`](../../src/mask/types.ts#L35) _(type, type-only)_

A single compiled alternative of a mask (masks can have `||`-separated alternative patterns) — its parsed entries and how many are token slots.

<a id="TMaskCompiled"></a>
#### [`TMaskCompiled`](../../src/mask/types.ts#L42) _(type, type-only)_

The fully compiled form of a mask string — every `||`-separated alternative pattern, ready for `apply`/`unapply`/`isValid` to try against a value.

<a id="TMaskApplyOptions"></a>
#### [`TMaskApplyOptions`](../../src/mask/types.ts#L48) _(type, type-only)_

Options for `MaskUtils.apply` — `applyWhenValid` restricts formatting to only fully-valid values.

<a id="MaskUtils"></a>
#### [`MaskUtils`](../../src/mask/utils.ts#L4) _(class)_

Public static wrapper over `_Mask` — compile/apply/unapply/validate input masks, plus registering custom token characters.

<a id="MaskUtils.compile"></a>
- [`compile`](../../src/mask/utils.ts#L5)
  Compiles a mask pattern string (`||`-separated alternatives) into a reusable, cached `TMaskCompiled`.
<a id="MaskUtils.apply"></a>
- [`apply`](../../src/mask/utils.ts#L6)
  Formats `value` (raw or already-masked) against `mask`, picking whichever pattern alternative scores best.
<a id="MaskUtils.unapply"></a>
- [`unapply`](../../src/mask/utils.ts#L7)
  Strips a masked `value` back down to its raw (token-matching-only) characters.
<a id="MaskUtils.isValid"></a>
- [`isValid`](../../src/mask/utils.ts#L8)
  Whether `value` (masked or raw) fully satisfies at least one alternative of `mask`.
<a id="MaskUtils.registerToken"></a>
- [`registerToken`](../../src/mask/utils.ts#L9)
  Registers a custom mask token character (must be a single, non-reserved character).
<a id="MaskUtils.unregisterToken"></a>
- [`unregisterToken`](../../src/mask/utils.ts#L10)
  Removes a previously registered custom mask token. Returns whether it existed.
<a id="MaskUtils.getTokenKeys"></a>
- [`getTokenKeys`](../../src/mask/utils.ts#L11)
  Every registered mask token key — built-in and custom.
<a id="MaskUtils.caretPositionAfterFormat"></a>
- [`caretPositionAfterFormat`](../../src/mask/utils.ts#L12)
  Depois de reformatar um valor mascarado (ex.: usuário digitou no meio de
"111.444.777-35"), o caret pode ficar em qualquer posição do texto novo —
não reimplementa o parsing do pattern: conta quantos caracteres "raw"
(via `unapply`, já existente) ficam antes do caret no texto anterior, e
acha a posição no texto novo onde essa mesma contagem é atingida. Quando
a posição cai numa sequência de literais (ex.: logo depois de um "."), o
caret avança até o próximo caractere preenchível — não fica preso entre
literais.
