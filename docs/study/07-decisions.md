# 07 — Decisões (tomadas por mim, com base em `06-repo-analysis.md`)

Você delegou a decisão. Cada uma tem: **decisão · por quê (evidência) · consequência**. Reversível enquanto não houver consumidor externo.

## D1. `Mask`: spec em **objeto** é a forma canônica; a **string atual continua 100% válida** (açúcar)
- **Por quê:** 281 usos de `mask="…"` em 11 repos usam strings (`000.000.000-00`, `AA.AAA.AAA/AAAA-00`, `(00) 0000-0000‖(00) 00000-0000`) e constantes `MASK_*`: quebrar isso inviabiliza a adoção.
  Já o que **não** cabe na string (`d0/M0/0000`, `Hh:m0`, `separator.2`, hora digitada `848→8:48`, dígito verificador) precisa de **campos com restrição, alinhamento à direita, valor tipado e checagens** — isso é dado, não sintaxe.
- **Consequência:** `Mask.apply/unapply/valid(valor, string | spec | presetId)`. Spec = segmentos `literal | field(charset, width, pad, range|enum, check)` + opções `reversed/eager/lazy`.
  Três valores (`masked/unmasked/typed`) e `Mask.pipe`. Regras **por instância** (fim do estado global `setRule`). Notação por letra repetida (`hh:mm:ss`) fica **para depois** (açúcar sobre o objeto).

## D2. **Regra por região fica FORA do núcleo**; o núcleo só tem o motor genérico (`ChecksumUtils`)
- **Limite (definido por você):** documentos, formatos e regras de negócio que dependem de país/região (CPF, CNPJ, IE, CEP, DDD…) não pertencem à lib agnóstica; "se for feito, será outra lib".
- **Por quê (evidência):** o mesmo domínio já existe em Kotlin (javaValidationsBR), em ~9 libs JS e em utilitários dos seus apps — é conhecimento regional e muda por lei (ex.: CNPJ alfanumérico). Misturar isso no núcleo prenderia a lib a um país e a um calendário de mudanças legais.
- **Consequência:** o núcleo oferece só o **mecanismo** — `ChecksumUtils` (soma ponderada configurável, Luhn, mod 97), e a `Mask` com spec/presets **registráveis**. Quem define um documento é **um pacote de região**, que *consome* o núcleo (não o contrário).
  `@lotexiu/br` é esse pacote: **opcional**, separado, sem ser dependência de nada do núcleo. É um **primeiro caso de uso** (e conjunto de vetores de teste), não parte do produto principal; pode ser movido para outro repositório, congelado ou descartado sem afetar a lib. **Não** vamos portar IE por UF para dentro do núcleo; se um dia for feito, entra em `@lotexiu/br` (ou outro pacote de região).
  O núcleo não cita nenhum país em código, comentários ou vetores de teste.

## D3. Tempo: **tipos próprios, imutáveis, sem `Date` por baixo**; formatação só pela `Mask`
- **Por quê:** `new Date(` 2.709× + 4 bibliotecas de data convivendo + parsers por `slice` + bug do cronômetro (59 s). Temporal/jiff/`@internationalized/date` convergem em separar *instante × civil × duração*.
- **Consequência:** `Duration` (unidades separadas **e** total), `CivilDate`/`CivilTime` com validação real, `Instant`; relógio e fuso **injetáveis** (provider). `StopWatch` ganha **pausa/retomada**. `Time` atual vira camada de compatibilidade. O que adicionei antes (`DateUtils.duration`, `Time.refresh`) é absorvido por esses tipos.

## D4. Headless: **intenções + "props por parte" como dados**, **transições puras** com invólucro reativo
- **Por quê:** a20 e sgps-web reimplementaram `select`, `list`, `pagination`, `active-filters`, `column-config`, `date-picker`, `keyboard-capture`, `select-checkbox`; `<ng-select>` (1.739 usos) e `ngx-datatable` mostram o conjunto de recursos exigido
  (`bindLabel/bindValue`, múltiplo, limpar, busca, scroll virtual, paginação/ordenação **externas**, seleção, colunas). Zag/React Aria/Downshift/TanStack provam que o padrão funciona **entre frameworks**; Grimoire mostra que o valor está nos **módulos puros testáveis** (`selection`, `windowing`, `filters`).
- **Consequência:** ordem: `collection → navigation/selection → listbox → select/combobox → pagination/sort/filters (modelo de tabela) → field/form → calendar`. Estado controlável de fora (signals), gancho de override (`reducer`), a11y como dado.

## D5. Adaptadores em **pacotes separados**: `@lotexiu/react` (criado) e **`@lotexiu/angular` (próximo)**
- **Por quê:** o núcleo não conhece framework (sua regra). Angular é o framework dominante e já migra para signals; React/Next/RN vêm em seguida.
- **Consequência:** `@lotexiu/react` existe com `useReactive/useMutableReactive/useSignal/useComputed/useSubscribe` (10 testes). Angular: ponte `signal`↔Angular `signal` + pipe/diretiva de máscara. Componentes visuais ficam **fora** (cada app estiliza).

## D6. Tema: **papéis como dado**, com preset **shadcn** (o que vocês já usam) e preset tonal; espaço de cor **OKLCH**; contraste declarado
- **Por quê:** a20/sgbi/docs-web usam `background/foreground/card/popover/primary/secondary/muted/accent/ring/sidebar-*/chart-1..5`; `colorjs.io` já é dependência (a20 e a lib) e OKLCH é perceptual o bastante; HCT exigiria porte próprio sem necessidade comprovada.
- **Consequência:** `ThemeStyle.resolve(scheme, mode)` com `scheme` **objeto passado pelo usuário** (presets prontos, não embutidos). Remove as escalas fixas que adicionei.

## D7. **Vetores de teste em JSON**, compartilhados entre TS, Kotlin e (futuro) Rust
- **Por quê:** o mesmo domínio já existe em Kotlin (javaValidationsBR) e em ~9 libs JS; provar equivalência é o ganho mais barato.
- **Consequência:** `vectors/*.json` (`checksum`, `br`, `mask`, `duration`); os testes TS leem os arquivos; o Kotlin pode ler os mesmos.

## D8. Primitivas de "lógica de app" pequenas e agnósticas (vistas no Grimoire e nos seus utils)
`queue` (concorrência, retry, progresso, cancelamento) · `mutex`/trava de mutação · `rateLimiter` · `codec` de código compartilhável versionado (`mp1:`) ·
`undo/redo` (já há `ValueHistory`; sgps-web reescreveu um) · janela virtual (`virtualRange`) · restauração de scroll (dado: offset por chave).

## D9. Organização
`packages/typescript` (núcleo agnóstico) · `packages/react` · `packages/angular` · `packages/br` · (futuro) núcleo Rust. Cada um continua podendo virar repositório/submódulo próprio.
**Não** colocar CSS/DOM no núcleo. Cada módulo novo: `types.ts`, `model|utils.ts`, testes ao lado (`src/.test`), vetores em JSON quando houver entrada→saída.

## Ordem de execução
1. ~~Checksum + `@lotexiu/br`~~ **feito** (motor no núcleo; `br` fica como pacote opcional de exemplo, sem expandir).
2. ~~`Mask` v2~~ **fase A feita** (reversed/pad/number/3 valores/regras por instância/checks/presets registráveis — ver `02` §3.5); faltam calendário, blocos nomeados, cursor, normalização. Original: (reversed/pad/3 valores/regras por instância/blocos/checks/presets registráveis) — **região-agnóstica**, testada com vetores neutros (duração, número, data, alfanumérico).
3. ~~`Duration`/`CivilDate`/`CivilTime` + `StopWatch` com pausa~~ **feito** como `Duration`/`PlainDate`/`PlainTime`/`CalendarUtils` (nomes do Temporal, ver `08` e `04`); `StopWatch` com pausa.
4. `collection → navigation/selection → listbox → select`, depois modelo de tabela (sort/page/filter/select).
5. `@lotexiu/angular`.
6. Tema v2. 7. Primitivas de D8. *(IE por UF: só se `@lotexiu/br` ganhar prioridade — fora do núcleo, ver D2.)*
