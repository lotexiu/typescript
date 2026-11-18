# `mask`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`defaultRules`](#defaultrules) | função | Regras de caractere padrão. Cada engine começa com estas (e pode somar as suas). |
| [`MASK_PRESETS`](#mask_presets) | constante | Presets **neutros** (sem nada de país/região). Presets de região vêm de pacotes de região, via `Mask.preset`. |
| [`MASK_CODECS`](#mask_codecs) | constante | Codecs embutidos (texto ↔ valor tipado): `text`, `integer` e `duration` (milissegundos). |
| [`Mask`](#mask) | classe | Porta única de formatação por máscara. A API estática antiga (`apply/unapply/valid`, regras globais) continua igual e usa uma instância padrão; para algo mais rico use `Mask.of(...)`: |
| [`TMaskRule`](#tmaskrule) | tipo | Uma regra de caractere: quais caracteres a letra aceita. |
| [`TMaskPad`](#tmaskpad) | tipo | Preenchimento do valor cru antes de aplicar o padrão (só se houver algo digitado). `side` padrão: `start` se `reversed`, senão `end`. |
| [`TMaskSlice`](#tmaskslice) | tipo | Checagens sobre o valor **sem máscara**, descritas só com dados (portáveis). `from`/`to` seguem `String.slice` (negativos contam do fim — úteis em formatos alinhados à direita). |
| [`TMaskCheck`](#tmaskcheck) | tipo | Uma checagem sobre o valor sem máscara (faixa, lista, tamanho, dígito verificador, data) — dado, não código. |
| [`TMaskIssue`](#tmaskissue) | tipo | Motivo de uma falha de `check`. |
| [`TMaskCheckResult`](#tmaskcheckresult) | tipo | Resultado de `check`: ok ou o motivo. |
| [`TMaskNumber`](#tmasknumber) | tipo | Número decimal "da direita para a esquerda": os dígitos digitados entram por último; separadores são parâmetros. |
| [`TMaskCodecId`](#tmaskcodecid) | tipo | Codecs embutidos. |
| [`TMaskCodec`](#tmaskcodec) | tipo | Converte o texto sem máscara num valor tipado e de volta. |
| [`TMaskOptions`](#tmaskoptions) | tipo | Opções de uma máscara além do padrão. |
| [`TMaskDefinition`](#tmaskdefinition) | tipo | Máscara registrável: um padrão (string) + opções. É só dado. |
| [`TMaskParsed`](#tmaskparsed) | tipo | Os três valores de um texto: mascarado, sem máscara e tipado, mais o resultado das checagens. |

---

## `defaultRules`

função · [src/mask/declarations.ts:8](../../src/mask/declarations.ts#L8)

Regras de caractere padrão. Cada engine começa com estas (e pode somar as suas).

```ts
function defaultRules(): Map<string, TMaskRule>
```

---

## `MASK_PRESETS`

constante · [src/mask/declarations.ts:27](../../src/mask/declarations.ts#L27)

Presets **neutros** (sem nada de país/região). Presets de região vêm de pacotes de região, via `Mask.preset`.

```ts
const MASK_PRESETS: Readonly<Record<string, TMaskDefinition>>
```

### Estáticos

#### `'duration-clock': { pattern: '0{1,}:00:00', reversed: true, pad: { char: '0', length: CLOCK_MIN_DIGITS }, codec: 'duration', checks: [ { type: 'range', from: -4, to: -2, min: 0, max: MINUTES_OR_SECONDS_MAX }, { type: 'range', from: -2, min: 0, max: MINUTES_OR_SECONDS_MAX }, ], }`

#### `'time-hm': { pattern: '00:00', checks: [ { type: 'range', from: 0, to: 2, min: 0, max: HOURS_MAX }, { type: 'range', from: 2, to: 4, min: 0, max: MINUTES_OR_SECONDS_MAX }, ], }`

#### `integer: { pattern: '0{1,}', codec: 'integer' }`

#### `'card-groups': { pattern: '0000 0000 0000 0000', checks: [{ type: 'luhn' }] }`

---

## `MASK_CODECS`

constante · [src/mask/declarations.ts:86](../../src/mask/declarations.ts#L86)

Codecs embutidos (texto ↔ valor tipado): `text`, `integer` e `duration` (milissegundos).

```ts
const MASK_CODECS: Readonly<Record<TMaskCodecId, TMaskCodec>>
```

---

## `Mask`

classe · [src/mask/model.ts:21](../../src/mask/model.ts#L21)

Porta única de formatação por máscara. A API estática antiga (`apply/unapply/valid`, regras globais) continua igual
e usa uma instância padrão; para algo mais rico use `Mask.of(...)`:

```ts
Mask.of('duration-clock').format(1_936_000)            // "32:16"
Mask.of('duration-clock').parse('1:05:07').typed       // 3_907_000 (ms)
Mask.of({ number: { scale: 2, decimal: ',', group: '.' } }).apply('1234567') // "12.345,67"
Mask.of({ pattern: 'NN-NN', rules: { N: { match: ['[A-Z0-9]'] } } })         // regra só desta máscara
```

```ts
class Mask
```

### Estáticos

#### `static readonly rules = Mask.#default.rules`

Regras de caractere registradas no motor padrão (reativo).

#### `static readonly ruleKeys = Mask.#default.ruleKeys`

Letras das regras registradas (reativo).

#### `static readonly ruleMatcher = Mask.#default.ruleMatcher`

Regex que reconhece qualquer letra de regra num padrão (reativo).

#### `static resetRulesToDefault()`

Volta às regras padrão (`0`, `A`, `W`, `U`, `L`, `S`, `C`, `E`, `X`).

#### `static clearRules()`

Remove todas as regras do motor padrão.

#### `static setRule(key: string, rule: TMaskRule)`

Registra ou troca uma regra (`key` é a letra usada no padrão).

#### `static apply(value: string, mask: string, options?: TEngineOptions)`

Formata `value` com o padrão. Alternativas separadas por `||` são tentadas em ordem.

#### `static unapply(value: string, mask: string, options?: TEngineOptions)`

Tira os literais da máscara, deixando só o que foi digitado.

#### `static valid(value: string, mask: string): boolean`

Se o texto já está completo e na forma exata do padrão.

#### `static validWithoutMask(value: string, mask: string): boolean`

Se o texto sem os literais caberia completo no padrão.

#### `static preset(id: string, definition: TMaskDefinition): void`

Registra (ou substitui) um preset — só dados. É assim que pacotes de região/domínio trazem os seus.

#### `static hasPreset(id: string): boolean`

Se existe um preset com esse id.

#### `static of<T = string>(spec: string | TMaskDefinition): MaskFormatter<T>`

Uma máscara pronta: id de um preset, um padrão (`'000.000'`) ou uma definição completa.

#### `static date(config: TMaskDateConfig): MaskFormatter<PlainDate>`

Data digitada só com números, com **calendário validado**; ordem e separador são parâmetros. Tipado = `PlainDate`.

#### `static number(config: TMaskNumber): MaskFormatter<number>`

Atalho para números "da direita" (valor monetário, quantidade...): separadores e casas são parâmetros.

---

## `TMaskRule`

tipo · [src/mask/types.ts:4](../../src/mask/types.ts#L4)

Uma regra de caractere: quais caracteres a letra aceita.

```ts
type TMaskRule = { … }
```

### Propriedades

#### `match: string[]`

Fontes de regex (sem âncoras) aceitas pela letra.

#### `flags?: string`

Flags do regex (`u` para propriedades Unicode).

---

## `TMaskPad`

tipo · [src/mask/types.ts:12](../../src/mask/types.ts#L12)

Preenchimento do valor cru antes de aplicar o padrão (só se houver algo digitado). `side` padrão: `start` se `reversed`, senão `end`.

```ts
type TMaskPad = Readonly<{ char: string; length: number; side?: 'start' | 'end' }>
```

---

## `TMaskSlice`

tipo · [src/mask/types.ts:19](../../src/mask/types.ts#L19)

Checagens sobre o valor **sem máscara**, descritas só com dados (portáveis).
`from`/`to` seguem `String.slice` (negativos contam do fim — úteis em formatos alinhados à direita).

Trecho do valor sem máscara (`String.slice`).

```ts
type TMaskSlice = Readonly<{ from: number; to?: number }>
```

---

## `TMaskCheck`

tipo · [src/mask/types.ts:24](../../src/mask/types.ts#L24)

Uma checagem sobre o valor sem máscara (faixa, lista, tamanho, dígito verificador, data) — dado, não código.

```ts
type TMaskCheck =
Readonly<{ type: 'range'; from?: number; to?: number; min: number; max: number }>
| Readonly<{ type: 'enum'; from?: number; to?: number; values: readonly string[] }>
| Readonly<{ type: 'length'; min?: number; max?: number }>
/** Últimos `specs.length` caracteres são dígitos verificadores, calculados em sequência (o 2º usa corpo + 1º). */
| Readonly<{ type: 'weighted'; specs: readonly TWeightedSpec[] }>
| Readonly<{ type: 'luhn' }>
| Readonly<{ type: 'mod97' }>
/** A data formada pelos 3 trechos existe no calendário (bissexto, dia por mês). Trecho ainda vazio = incompleto, passa. */
| Readonly<{ type: 'date'; year: TMaskSlice; month: TMaskSlice; day: TMaskSlice }>
```

---

## `TMaskIssue`

tipo · [src/mask/types.ts:36](../../src/mask/types.ts#L36)

Motivo de uma falha de `check`.

```ts
type TMaskIssue = 'pattern' | 'range' | 'enum' | 'length' | 'check-digit' | 'calendar'
```

---

## `TMaskCheckResult`

tipo · [src/mask/types.ts:38](../../src/mask/types.ts#L38)

Resultado de `check`: ok ou o motivo.

```ts
type TMaskCheckResult = Readonly<{ ok: true }> | Readonly<{ ok: false; reason: TMaskIssue }>
```

---

## `TMaskNumber`

tipo · [src/mask/types.ts:41](../../src/mask/types.ts#L41)

Número decimal "da direita para a esquerda": os dígitos digitados entram por último; separadores são parâmetros.

```ts
type TMaskNumber = Readonly<{ scale: number; decimal: string; group?: string; groupSize?: number }>
```

---

## `TMaskCodecId`

tipo · [src/mask/types.ts:44](../../src/mask/types.ts#L44)

Codecs embutidos.

```ts
type TMaskCodecId = 'text' | 'integer' | 'duration'
```

---

## `TMaskCodec`

tipo · [src/mask/types.ts:47](../../src/mask/types.ts#L47)

Converte o texto sem máscara num valor tipado e de volta.

```ts
type TMaskCodec<T = unknown> = Readonly<{
	/** valor sem máscara → valor tipado (`undefined` se não dá para interpretar) */
	parse(unmasked: string): T | undefined;
	/** valor tipado → valor sem máscara */
	format(typed: T): string | undefined;
}>
```

---

## `TMaskOptions`

tipo · [src/mask/types.ts:55](../../src/mask/types.ts#L55)

Opções de uma máscara além do padrão.

```ts
type TMaskOptions = Readonly<{
	/** Preenche da direita para a esquerda (números, durações). */
	reversed?: boolean;
	pad?: TMaskPad;
	checks?: readonly TMaskCheck[];
	/** Como o valor sem máscara vira valor tipado. Padrão: `text`. */
	codec?: TMaskCodecId | TMaskCodec;
	/** Formato numérico (substitui o padrão de caracteres). */
	number?: TMaskNumber;
	/** Regras de caractere **só desta máscara** (somam-se às padrão; não mexem no estado global). */
	rules?: Readonly<Record<string, TMaskRule>>;
}>
```

---

## `TMaskDefinition`

tipo · [src/mask/types.ts:69](../../src/mask/types.ts#L69)

Máscara registrável: um padrão (string) + opções. É só dado.

```ts
type TMaskDefinition = TMaskOptions & Readonly<{ pattern?: string }>
```

---

## `TMaskParsed`

tipo · [src/mask/types.ts:72](../../src/mask/types.ts#L72)

Os três valores de um texto: mascarado, sem máscara e tipado, mais o resultado das checagens.

```ts
type TMaskParsed<T> = Readonly<{ masked: string; unmasked: string; typed: T | undefined; check: TMaskCheckResult }>
```
