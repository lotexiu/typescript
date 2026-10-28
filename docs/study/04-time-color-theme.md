# 04 — Tempo, calendário, cor e tema

> Contexto: você disse que essas áreas estão fracas e que pretende redesenhá-las. Aqui só o que dá para
> **aprender com outros** antes de redesenhar, e o que do que eu fiz é **provisório**.

## 1. Tempo / data / calendário

### O que a indústria converge
- **Tipos separados por significado, imutáveis.** Temporal (JS): `Instant` (ponto exato) · `ZonedDateTime` (ponto + fuso) ·
  `PlainDate`/`PlainTime`/`PlainDateTime` (civil, sem fuso) · `Duration` (imutável; `overflow:'reject'` faz `31/02` lançar erro).
  [flaviocopes](https://flaviocopes.com/temporal-api/), [2ality](https://2ality-com.onrender.com/2021/06/temporal-api.html). Status: Stage 4 em 2025 (algumas fontes), suporte de navegadores ainda irregular → verificar antes de depender.
- **jiff (Rust)** segue o mesmo desenho e justifica: separa *tempo absoluto* (`Timestamp`, `Zoned`) de *civil* (`civil::DateTime`);
  **`Span`** guarda cada unidade separada (mês ≠ 30 dias; "1 mês" de março a abril = de abril a maio) e **`SignedDuration`** é só ns; erros sempre `Result` com mensagem;
  aritmética de dias respeita transição de fuso (dia de 23/25 h). Critica chrono/time por generics pesados e por não separar esses mundos.
  [DESIGN.md](https://github.com/BurntSushi/jiff/blob/master/DESIGN.md).
- **`@internationalized/date`** (React Aria): objetos imutáveis **cientes de calendário** (vários sistemas), `DateFormatter` sobre `Intl.DateTimeFormat` com correções de bugs de navegador;
  agnóstico de framework. [DateFormatter](https://react-aria.adobe.com/internationalized/date/DateFormatter).
- **Formatação por partes**: `Intl.DateTimeFormat.formatToParts` e `Intl.DurationFormat.formatToParts` devolvem **partes tipadas** (não string) — o consumidor
  recompõe. É o mesmo princípio do `Spec` em `02`.

### Estado atual da lib (medido) e o que é provisório
| Item | Situação |
|---|---|
| `Time` (campos `year…ms` como `field`s sobre um `Date`) | mistura *instante*, *civil* e *calendário* num só tipo mutável; `calendarDays` (grade de 42 células) é ótimo ponto de partida do **calendar** headless |
| `DateUtils.duration(ms)` (**meu**) | só decompõe; **provisório** — vira o `Duration` do modelo novo |
| `Time.refresh()` (**meu**) | existe só porque `Time` não tem "agora"; **provisório** |
| `ticker` (**meu**) | OK como composable; usa `setInterval` (para Rust, o relógio precisa ser **injetável**) |
| `DateUtils.formatMS`, `clock` | **removidos** (formatação passa a ser da `Mask`/spec) |

### Status — modelo de tempo **implementado** (2026-10-28), no vocabulário do Temporal
`src/plain/`: `Duration` (unidades fixas, ISO 8601 `PT1H5M7S`, sinal à parte), `PlainDate` (valida de verdade, anos 1–9999, `add` com meses que "prendem" o dia, dias desde a época, dia da semana/do ano),
`PlainTime` (volta de 24h, `until` sem volta), `CalendarUtils.month(ano, mês, { weekStart, weeks })` (base de date-picker; substitui o `buildCalendarDays` do a20).
Sem `Date` por baixo, sem fuso, imutáveis, `tryX` devolve `undefined` e `from` lança `RangeError` com a causa. Escolhi **os nomes do Temporal** de propósito: ele já saiu no Firefox 139 e no Chrome 144 (Safari ainda não), então é o que as pessoas vão aprender (ver `08`); estes tipos funcionam onde ele não chega e a troca é quase mecânica.
Integrado à `Mask`: `Mask.date({ order, separator })` (valor tipado `PlainDate`, calendário validado). `StopWatch` ganhou `pause()/resume()`.
**Fora, de propósito:** fuso/`Instant` (virá como *provider*), meses/anos em `Duration`, `PlainDateTime`. **Removido:** `DateUtils.duration` (substituído por `Duration`). `Time` (o antigo, mutável) fica como legado.

### Recomendação (original) **[proposta]**
Modelo mínimo e agnóstico (sem `Date` por baixo, para não herdar seus defeitos e facilitar Rust): `Duration` (unidades separadas **e** total em ms/ns),
`CivilDate` {ano, mês, dia} com calendário gregoriano e **validação real** (bissexto), `CivilTime`, `Instant` (número), e conversões explícitas
com fuso **via provider** (`(instant) => offset`). Formatação/parsing **só pela `Mask`/spec** (campos `y M d h m s`, ver `02`). Calendário headless
(`03`, L5) em cima de `CivilDate`.

## 2. Cor e tema

### O que aprender
- **Material Color Utilities** ([repo](https://github.com/material-foundation/material-color-utilities); TS, Dart, Java, C++, Swift, Kotlin): espaço **HCT** (matiz, croma, **tom** = luminância perceptual L\*),
  `TonalPalette` (varia só o tom), `DynamicScheme` (cores que se ajustam a modo claro/escuro, estilo e **contraste pedido**), módulo `contrast`.
  Ponto-chave: como o tom é perceptual, **dois tons com diferença fixa garantem contraste** — por isso "main=80/onMain=20" funciona por construção.
  *(a fonte não explica o mecanismo; é a propriedade geral do L\*.)* **Nossa `TonalPalette` usa a luminosidade do OKLCH (`L = tom/100`), que é perceptual mas não é L\*/HCT** — o tom 40 ≠ L\*40.
- **Radix Colors** ([escala](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)): **12 passos com papel fixo** — 1–2 fundo, 3–5 fundo de componente (normal/hover/ativo), 6–8 bordas, 9–10 sólido, 11–12 texto (baixo/alto contraste).
  O que importa: o **nome do papel é estável**, e a **tabela passo→papel é dado**. Modelo melhor que "escolher um tom na mão".
- **Contraste dirigido** (Leonardo/APCA): gerar a cor **a partir da razão de contraste desejada**, não do número do tom. *(não consegui abrir fonte sobre Leonardo; é conhecimento geral — validar antes de adotar.)*
- **Design tokens** (W3C DTCG / Style Dictionary): tokens como **dados** com alias (`color.surface` → `color.neutral.900`) e conversão para vários alvos (CSS, iOS, Android).
  *(não pesquisado a fundo aqui.)*

### O que é provisório do que eu fiz **[medido/meu]**
| Item | Problema |
|---|---|
| `ThemeStyle.resolve` com escalas **fixas** (`main` 80/40, `surface1..3` 15/20/26 …) em `theme/style/declarations.ts` | é **preset embutido** — o mesmo problema da `clock`. Deve ser **dado passado pelo usuário** (com 2–3 presets prontos: "tonal", "radix-12", "alto-contraste"), e ter **garantia de contraste por construção** (ou checada) |
| `Palette.onColor` | procura entre 2 tons (10/100) por WCAG — solução rasa; o certo é ter o par (cor, on-cor) vindo do preset/contraste pedido |
| `Palette.derive` / `.neutral()` (`hueShift`, croma 0,03) | números mágicos; viram parâmetros do preset |
| `ColorUtils` | camada fina sobre o colorjs; manter só se decidir isolar a dependência |
| Tom como `number` 0–100 | ok, mas precisa decidir o **espaço** (OKLCH vs HCT/CAM16) — define se "tom" garante contraste |

### Recomendação **[proposta]**
1. Decidir o **espaço de tom** (OKLCH é simples e já está no colorjs; HCT dá a garantia de contraste do Material mas pede implementação própria/porta).
2. **Papéis como dados** (como Radix): `ThemeScheme = { roles: { [nome]: { slot, passo|tom|contraste, modo } } }`; presets = objetos; `ThemeStyle.resolve(scheme, mode)`.
3. **Contraste como requisito declarado** (`min: 4.5`) e verificado/gerado.
4. Saída **sempre dados** (cores); exportar CSS/Tailwind/Android é **adaptador** (o app já faz o CSS em `theme/css-vars.ts`).
