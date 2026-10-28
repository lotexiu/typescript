# 08 — O que as pessoas realmente precisam (e por que evitam libs)

> Pergunta: o que falta é **conhecimento das necessidades**. O que as pessoas fazem por falta de recurso, de conhecimento ou porque a lib não é fácil/intuitiva?
> Fontes: seus repositórios (medido, ver `06`) + pesquisa. **[medido]** = código local · **[fonte]** = citado · **[inferência]** = conclusão minha, marcada quando a fonte não diz.

## 1. O que as pessoas fazem quando falta o recurso certo

| O que fazem | Onde se vê | Causa provável | O que a lib deve oferecer |
|---|---|---|---|
| **Escrevem o utilitário à mão** (hora `848→8:48`, `paraMinutos`, cronômetro, `slice` para trocar formato de data) | `sgps-web/util/*` **[medido]** | o recurso existe em libs grandes, mas importar moment/luxon "só para isso" parece caro; ou não achavam | funções **pequenas, diretas**, que cobrem o caso comum sem puxar um mundo |
| **Quatro libs de data ao mesmo tempo** + `new Date(` 2.709× | moment, dayjs, date-fns, luxon **[medido]** | cada projeto escolheu uma; migrar custa; `Date` nativo é "bom o bastante" até dar bug | **um** modelo pequeno e previsível, com nomes que já se conhecem |
| **Uma lib de máscara por projeto** (ngx-mask, imask, maskito, text-mask, currency-mask…) | 9+ soluções **[medido]** | máscara de texto, de número e de data são libs diferentes; cada uma cobre um pedaço | uma porta só (`Mask`) para texto, número, data e duração |
| **Reescrevem select/lista/paginação/date-picker/captura de teclado** em cada app | a20 e sgps-web **[medido]** | libs de UI vêm com visual e estilo próprios; "não consigo estilizar do meu jeito" | **lógica sem visual** (headless) para só pôr o próprio estilo |
| **Escolhem a máscara pelo conteúdo à mão** (`getDocumentMask`, `getPhoneMask`) | a20 `formats.ts` **[medido]** | alternativas `‖` existem, mas não são óbvias nem testáveis | presets e alternativas **nomeadas**, com `check` explícito |
| **Validação duplicada em várias linguagens** (Kotlin + 9 libs JS) | javaValidationsBR **[medido]** | sem fonte única de regra | **dados + vetores de teste** compartilháveis |
| **Código com bug sutil** (cronômetro vira o minuto aos 59 s; parser de data com `alert` dentro) | sgps-web **[medido]** | lógica de tempo é traiçoeira e ninguém testa | tipos que **impedem** o erro e testes prontos |

## 2. Por que evitam (ou abandonam) uma biblioteca
1. **Datas são a 2ª maior dor da linguagem.** Na pesquisa State of JS 2025, "datas" ficou logo atrás da falta de tipagem estática (uma fonte cita ~10% das respostas); a API é descrita como "verbosa e propensa a erro". [DevClass](https://www.devclass.com/development/2026/02/10/javascript-survey-reveals-gripes-against-date-handling-webpack-and-nextjs-and-that-typescript-has-won/4090262), [@IT](https://atmarkit.itmedia.co.jp/ait/spv/2603/11/news053.html) **[fonte]**
   A resposta oficial é o **Temporal** (Firefox 139, Chrome 144; Safari ainda não, até fev/2026) — [SpiderMonkey](https://spidermonkey.dev/blog/2025/04/11/shipping-temporal.html), DevClass. **Implicação:** o vocabulário que as pessoas **vão aprender** é o do Temporal (`PlainDate`, `PlainTime`, `Duration`); nossos tipos devem falar a mesma língua e não competir com ele.
2. **Dependência cansa e arrisca.** O modelo do shadcn/ui ("copie o código, é seu") explodiu justamente por **controle, sem caixa-preta e sem atualização que quebra**; o preço é update manual. [OpenReplay](https://blog.openreplay.com/developers-switching-shadcn-ui-react/), [DEV](https://dev.to/sanjaysah/you-should-own-your-ui-components-not-just-install-them-bce) **[fonte]**.
   E a cadeia de suprimento npm foi atacada de forma real (worm Shai-Hulud, set/nov-2025, centenas de pacotes). [The Register](https://www.theregister.com/2025/11/24/shai_hulud_npm_worm/) **[fonte]** — *as fontes tratam de detecção/resposta; "menos dependências reduz o risco" é inferência minha.*
3. **Libs "grandes demais".** O próprio Moment foi aposentado por tamanho/complexidade; migram para dayjs/date-fns por bundle e não ser *tree-shakeable*. [Moment — project status](https://momentjscom.readthedocs.io/en/latest/moment/-project-status/02-future/), [pkgpulse](https://www.pkgpulse.com/guides/why-developers-abandoning-momentjs-2026) **[fonte]**.
4. **O widget "pronto" não serve ao visual/uso do app.** Combobox customizado é difícil de acertar (semântica ARIA, teclado, leitor de tela) e é feito por necessidade de **estilo, busca e virtualização** que o `<select>` nativo não dá. [24a11y](https://www.24a11y.com/2019/select-your-poison/), [Adrian Roselli](https://adrianroselli.com/tag/pattern/page/2) **[fonte]**.
5. **Máscara que "quebra" na mão do usuário.** Relatos recorrentes: cursor que pula, colar do painel de área de transferência do teclado sem disparar `paste`, autofill do Chrome bagunçando campo numérico, comportamento diferente por teclado (Gboard × outros). [input-mask-android](https://github.com/LayoutEngine2/input-mask-android), [ProseMirror](https://discuss.prosemirror.net/t/cursor-behaviors-incorrectly-after-paste-on-mobile/8374), [Chrono forum](https://www.chronoengine.com/forums/topics/view/103895/input-masks-borked-on-mobile) **[fonte]**. *Causa provável (inferência):* reformatar o valor enquanto o IME está compondo e mover o cursor sem o IME saber.
6. **API que exige ler a documentação para o caso básico "falhou".** Regra repetida em guias de design de API: *coisas simples simples, complexas possíveis*; bons *defaults* + boas *escape hatches*; complexidade da chamada cresce com a do caso (progressive disclosure). [WWDC22 SwiftUI](https://wwdcnotes.com/notes/wwdc22/10059) **[fonte]**.

## 3. Regras de design que isso impõe  **[proposta]**
1. **O caso comum sai numa linha, sem configuração.** `Mask.of('duration-clock').format(ms)`; `Mask.number({...})`. Opções avançadas só quando pedidas.
2. **Dependência zero no que for lógica** (a lib já tem 1: `colorjs.io`). Módulos **autocontidos** (poucas importações cruzadas) para dar para **copiar um arquivo** e usar — o apelo do shadcn sem perder o pacote.
3. **Erro é valor, com motivo** (`{ ok:false, reason }`), nunca exceção surpresa nem "inválido silencioso"; e uma variante que lança só se pedida.
4. **Vocabulário que as pessoas já conhecem**: Temporal para tempo, ISO 8601 para texto, contrato do `python-stdnum` para documentos, padrões APG para widgets. Nome certo evita documentação.
5. **Escape hatches em todo lugar**: codec próprio, regra de caractere própria, `checks` próprios, estado controlável de fora, *reducer* para alterar transição.
6. **Documentação por receitas reais**, tiradas da tabela do §1 ("hora digitada `848→8:48`", "milhar/decimal", "calendário de um mês") — com os **vetores de teste** como exemplos executáveis.
7. **Adaptadores tratam as armadilhas do navegador** (caret, composição de IME, colar, autofill): o núcleo expõe `caretAfterFormat`; o adaptador de DOM o usa e testa em vários teclados. *(pendente — ver §4)*
8. **Qualidade que se vê**: tudo com teste ao lado; nada que o autor não consiga ler devagar (arquivos pequenos, nomes claros, sem número mágico).

## 4. Consequências imediatas no roadmap
- **Tempo** passa a seguir o vocabulário do Temporal (`PlainDate`, `PlainTime`, `Duration`), pequeno, imutável, validando de verdade (resolve o calendário que a `Mask` não tinha). Fica **fora**: fuso e `Instant` (viram *provider* depois) e meses/anos relativos em `Duration`.
- **Mask**: pendências viram prioridade pelo §2.5: `caretAfterFormat`, tratamento de composição/colar no adaptador, e `Mask.date(...)` parametrizável.
- **Headless**: priorizar o que o §1 mostra repetido (select/lista/paginação/seleção/teclado), com o estilo 100% do consumidor.
