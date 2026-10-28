# 02 — Máscara e formatação (datas, durações, números, documentos)

> Objetivo: a `Mask` ser a **porta única** de formatação (o que você pediu), cobrindo texto digitado, números,
> datas, durações e documentos — de forma **vaga/agnóstica** (só lógica e dados, sem DOM), portável para Rust.
> Marcação: **[medido]** = rodei no `dist` atual · **[fonte]** = citado de documentação · **[proposta]** = recomendação minha.

## 1. O que a `Mask` faz hoje (medido)

Funciona bem para formatos **de largura fixa preenchidos da esquerda para a direita**:

| Caso | Resultado |
|---|---|
| CPF `12345678901` + `000.000.000-00` | `123.456.789-01` ✅ |
| Telefone, alternativas `(00) 0000-0000\|\|(00) 00000-0000` | escolhe 10 ou 11 dígitos ✅ |
| Cartão `0000 0000 0000 0000`, `unapply` | ✅ |
| Entrada com lixo (`a1b2` em `0 0 0 0`) | descarta o que não casa → `1 2` ✅ |

**Não resolve** (e por quê):

| Caso | Hoje | Causa |
|---|---|---|
| Duração: `3216` → `32:16`; `537` → `5:37` | `3:21:6`, `53:7` | só preenche da esquerda; sem alinhar à direita nem zero-pad |
| Dinheiro `1234567` → `12.345,67` | `123.456,7` | idem; sem separador de milhar variável nem casas decimais |
| Data `31/02/2026` | `valid → true` | só confere dígitos; **sem calendário** (mês 1–12, dia por mês, bissexto) |
| CPF `123.456.789-01` (dígitos errados) | `valid → true` | **sem dígito verificador** |
| CNPJ alfanumérico `12.ABC.345/01DE-35` | com `00.000...` perde as letras (`12.345.013/5`) | máscara de dígitos rejeita letras |
| ...e com `AA.AAA...` | aceita minúscula e acentuada (`12.ábc…`) | a regra `A` é "letra Unicode + dígito", não `A–Z0–9` |
| Regra própria só para uma máscara | impossível | `Mask.setRule` é **estado global** |
| Valor tipado (número, data) | não existe | tudo é `string`; sem "valor tipado" separado do texto |
| Posição do cursor após formatar | não existe | já listado no CLAUDE.md |

Relevância atual: o **CNPJ alfanumérico** entrou em produção em julho/2026 (as fontes divergem na data exata);
qualquer `\d{14}`/máscara só de dígitos rejeita CNPJs válidos. O dígito segue **módulo 11**, com cada caractere
convertido para `código ASCII − 48` (A=17), pesos 5-4-3-2-9-8-7-6-5-4-3-2 e depois 6-5-4-3-2-9-8-7-6-5-4-3-2.
[Receita Federal (FAQ)](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf),
[TabNews](https://www.tabnews.com.br/oportunidados/cnpj-alfanumerico-o-que-muda-no-seu-sistema-e-como-validar-o-digito).
**[medido]** reproduzi o algoritmo: `12ABC34501DE → 35` (exemplo oficial), `123456780001 → 95`, CPF `123456789 → 09`.

## 2. O que as outras bibliotecas ensinam

### 2.1 IMask — o modelo mais completo que achei ([guia](https://imask.js.org/guide.html)) **[fonte]**
- **Três visões do mesmo dado**: `value` (texto mascarado), `unmaskedValue` (sem fixos, salvo `{ }`) e **`typedValue`**
  (número/Date; nas máscaras sem tipo é igual ao `unmasked`). Mudar qualquer uma resolve as outras.
- **Tipos de máscara**: padrão (`0`,`a`,`*`, `[opcional]`, `{fixo-no-valor}`), RegExp, função, **Number**
  (escala, separadores, min/max), **Date** (padrão + `format`/`parse`), **Enum**, **Range**, **Dynamic** (lista de máscaras
  ou `dispatch`) e **Pipe** (formata/converte **sem UI**, entre `MASKED`/`UNMASKED`/`TYPED`).
- **Blocos nomeados** (`blocks`) dentro do padrão, cada um com seu próprio sub-mask (ex.: mês = Range 1–12).
- Opções de comportamento: `lazy` (placeholder), `eager` (completa fixos), `overwrite`, `skipInvalid`, hooks `prepare`/`commit`/`validate`.

### 2.2 Maska ([docs](https://deepwiki.com/beholdr/maska)) **[fonte]**
Tokens customizáveis **por instância**, `reversed` (aplica da direita para a esquerda — é o que dinheiro/duração precisam),
`eager`, máscara dinâmica (a primeira que casa vence), modo `number`. Escape com `!`.

### 2.3 Cleave / cleave-zen ([Vaadin dir.](https://vaadin.com/directory/component/cleave-zen-textfield-formatter)) **[fonte, parcial]**
Idéia de **presets nomeados**: `creditCard`, `date` (`datePattern: ['Y','m','d']`), `numeral` (agrupamento de milhar),
`phone`. Não consegui abrir o README para confirmar assinaturas — usar só como inspiração do *conceito* de preset.

### 2.4 Formatação de tempo/duração
- **`Intl.DurationFormat`** (Baseline desde mar/2025): `style: 'digital'` → `1:50:00`; opções por unidade
  (`hours: 'numeric'|'2-digit'`, `minutesDisplay: 'auto'|'always'`, `fractionalDigits`), `formatToParts()`.
  [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat),
  [web.dev](https://web.dev/blog/intl-durationformat-baseline). Só JS e só locale do runtime.
- **Excel**: o código de tempo decorrido `[h]:mm:ss` — o colchete = "pode passar de 24 e não rola"; formato com até
  **4 seções** (positivo; negativo; zero; texto) separadas por `;`. [Microsoft](https://support.microsoft.com/office/5026bbd6-04bc-48cd-bf33-80f18b4eae68).
- **CLDR / UTS #35**: padrões de data (`yMMMd`) e **skeletons** — você pede *quais campos* e o dado da locale escolhe a
  ordem/pontuação (`availableFormats`). [Android DateFormat](https://developer.android.com/reference/kotlin/android/text/format/DateFormat).
- **Luxon**: `Duration.toFormat('hh:mm:ss')`; há bug conhecido de arredondar com unidades fracionárias
  ([issue](https://github.com/moment/luxon/issues/1070)). **jiff** (Rust): `Span` (guarda cada unidade separada) e `SignedDuration`
  (contagem única de ns) são tipos diferentes; formatação própria (`strtime`).
  [DESIGN.md](https://github.com/BurntSushi/jiff/blob/master/DESIGN.md).

### 2.5 Documentos — `python-stdnum` ([doc](https://arthurdejong.org/python-stdnum/doc/1.20/index.html)) **[fonte]**
Contrato único por módulo, repetido em centenas de documentos (CPF, CNPJ, IBAN, ISBN…):
`compact(n)` (canônico, sem validar) · `validate(n)` (devolve o compacto ou **lança erro tipado**) · `is_valid(n)` (nunca lança) ·
`format(n)` (exibição); módulos com dígito verificador somam `checksum(n)` e `calc_check_digit(n)`. Os algoritmos de
dígito (**Luhn, Verhoeff, Damm, ISO 7064, mod 11**) são **funções compartilhadas**. Exatamente o que falta aqui.

## 3. Proposta de arquitetura  **[proposta]**

Princípio: **dados + funções puras**. A `Mask` continua sendo a única porta do usuário; por baixo, ela passa a ter
camadas que também servem sozinhas (e portam para Rust sem closures mágicas).

```
 Checksum (puro)        mod11(pesos) · luhn · mod97(IBAN) · verhoeff · damm      ← funções e tabelas
      ▲
 Spec (dados)           segmentos: literal | campo(nome, charset, largura, pad, faixa/enum, check)
      ▲
 Engine                 parse(texto) · format(partes) · edit(texto, cursor, mudança) · isComplete/isValid
      ▲
 Codec (preset)         texto/partes  ↔  valor tipado   (duração, data, número, documento)
      ▲
 Mask (porta única)     Mask.apply/unapply/valid(...)  aceita  padrão-string | preset
```

### 3.1 O que muda na `Mask` (do menor para o maior)
1. **`reversed` / alinhamento à direita** + **`pad`** (char, lado) → resolve duração, dinheiro, milhar variável. *(Maska, IMask)*
2. **Três valores**: `masked` / `unmasked` / `typed` e um **pipe** `Mask.pipe(valor, de, para, spec)`. *(IMask)*
3. **Regras escopadas**: regra própria **por máscara**, não global (`Mask.create({ rules })` ou regras dentro do spec) e regras
   prontas corretas (`N` = `[A-Z0-9]`, `H` = hex…). Hoje `A` aceita letras Unicode e minúsculas.
4. **Blocos com restrição**: faixa (`1–12`), enum, e função `(partes) => erro?` para o calendário (dia ≤ dias do mês).
5. **`checks`**: lista de validadores sobre o valor compacto (`mod11`, `luhn`…) → `valid()` passa a recusar CPF errado.
6. **Opcionais `[ ]`** (IMask) para durações com hora opcional: `[h:]mm:ss`.
7. **Presets** registráveis (dados): `Mask.preset(id, spec)` + `Mask.of(id)`. O **núcleo só traz presets neutros** (`duration-clock`, número com milhar/decimais, data ISO, hex…).
   **Presets/regras de região** (documentos, telefone, CEP, moeda local…) **não** entram no núcleo: vêm de **pacotes de região** que se registram (`@lotexiu/br` é o exemplo) —
   motor ≠ dados por país, a lição do ICU4X (ver `05-rust-port.md`). Decisão D2 em `07-decisions.md`.

### 3.2 Esboço de API (TypeScript, só para discutir)
```ts
// 1) o que existe continua igual
Mask.apply('12345678901', '000.000.000-00')

// 2) preset = dado; o uso é o mesmo (presets de região vêm de um pacote de região registrado, não do núcleo)
Mask.apply('1936', 'duration-clock')            // "19:36"
Mask.valid('4111111111111112', 'card-luhn')     // false  (checagem Luhn — exemplo neutro de `checks`)

// 3) três valores
const m = Mask.of('money-br')
m.format({ typed: 1234567.5 })                  // "R$ 1.234.567,50"
m.parse('R$ 1.234.567,50')                      // { masked, unmasked: '123456750', typed: 1234567.5 }

// 4) duração: valor estruturado -> texto, alinhado à direita
Mask.of('clock').format({ typed: { h: 0, m: 32, s: 16 } })   // "32:16"   (h opcional some quando 0)
Mask.of('clock').format({ typed: { h: 1, m: 5,  s: 7  } })   // "1:05:07"

// 5) contrato de "documento" (python-stdnum) — vale para qualquer pacote de região que o implemente:
doc.compact(s) · doc.format(s) · doc.check(s) /* { ok, value } | { ok:false, reason } */ · doc.isValid(s)
```

### 3.3 Notação do spec (decisão pendente)
Duas escolhas legítimas; ambas se compilam para o mesmo spec de dados:
- **A. Estender a string da `Mask`**: manter `0 A W…` para texto e acrescentar **campos nomeados por letra repetida**
  (`h`, `mm`, `ss`, `yyyy`, `MM`, `dd` — convenção de CLDR/Java/.NET/Luxon) e `[ ]` opcional. Uma única sintaxe; risco: letras de campo
  colidem com as classes (`m`/`M`/`W`…), exigindo um *modo* explícito (`Mask.text(...)` × `Mask.fields(...)`).
- **B. Spec só em objeto** (`{ segments: [...] }`) e a string vira açúcar só para texto. Mais verboso, sem ambiguidade, mais fácil de portar/serializar.

Recomendo **B como forma canônica** (portável, serializável, testável) **+ A como açúcar** depois que B estiver firme.

### 3.4 Locale
Datas/números com nome de mês, separador decimal etc. dependem de dados de locale. Recomendo um **provider** (interface mínima:
`{ decimal, group, monthNames, weekdayNames, ... }`) em vez de embutir `Intl` — no JS o provider padrão chama `Intl`; em Rust
poderia apontar para ICU4X. A máscara de **texto digitado** (CPF etc.) não precisa de locale.

## 3.5 Status — Mask v2 fase A **implementada** (2026-10-28)
Região-agnóstica, só dados + funções puras; vetores em `vectors/mask.json`; 55 testes novos, os 26 antigos intactos.
- ✅ **Da direita para a esquerda** (`reversed`): preencher "de trás" = preencher o **padrão invertido** — mesmo motor, sem reescrita. Resolve milhar variável e duração (`3216→32:16`, `537→5:37`, `16→0:16`, `10507→1:05:07`).
- ✅ **`pad`** (preenchimento do valor cru) · **`number`** (escala + separadores como parâmetro: `1234567→12.345,67`; digitar 1 dígito por vez; sem região embutida).
- ✅ **Três valores**: `Mask.of(x).parse(texto) → { masked, unmasked, typed, check }` e `.format(typed)`. Codecs: `text`, `integer`, `duration` (ms) ou um objeto `{ parse, format }` seu.
- ✅ **`checks` como dados** (`range`, `enum`, `length`, `weighted` com dígitos em sequência, `luhn`, `mod97`) — `check()` devolve o **motivo**, nunca lança.
- ✅ **Regras por instância** (`Mask.of({ pattern, rules })`; fim do estado global para esse caso) e **motor por instância** (`MaskEngine`).
- ✅ **Presets registráveis** (`Mask.preset(id, definição)`; neutros embutidos: `duration-clock`, `time-hm`, `integer`, `card-groups`). Presets de região vêm de pacotes de região.
- ✅ **Calendário**: `Mask.date({ order: 'dmy'|'mdy'|'ymd', separator })` + check `{ type: 'date' }` (bissexto, dia por mês, mês 13); tipado = `PlainDate`.
- ⏳ Falta: **blocos nomeados** com faixa por campo em padrões de largura variável, **posição do cursor** após formatar, notação por letra repetida (`hh:mm:ss`), e **uppercase/normalização** por regra.

## 4. Casos de teste a exigir (vetores)
- Duração: `0→"0:00"`, `7000→"0:07"`, `1936000→"32:16"`, `3907000→"1:05:07"`, `90061000→"25:01:01"` (colchete tipo Excel), negativo com sinal.
- CPF `123.456.789-09` ✅ / `…-01` ❌. CNPJ `12.ABC.345/01DE-35` ✅, `…-34` ❌, numérico `12.345.678/0001-95` ✅, minúscula ❌.
- Data: `29/02/2024` ✅ / `29/02/2025` ❌ / `31/04` ❌; parcial `3112` → `31/12`.
- Dinheiro: `1234567` → `12.345,67`; digitar um dígito por vez; apagar com backspace; `0` → `0,00`.
- Entrada com lixo, colagem com máscara já aplicada, emoji/astral (a `Mask` já trata surrogate pairs — manter).
