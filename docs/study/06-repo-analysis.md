# 06 — Análise dos repositórios da máquina (e de projetos externos)

> Objetivo: decidir pelo que **de fato se usa e dói**, não pelo que parece elegante. Varri ~35 repositórios em
> `/mnt/D/repositories` (somente leitura) e li projetos externos como exemplo de cenários diferentes.
> Tudo abaixo foi **medido** com busca no código (`.ts/.tsx/.js/.html/.java/.dart`, sem `node_modules`/`dist`), salvo onde marcado **[fonte]**.

## 1. Panorama
~35 repositórios, a maioria sistemas de gestão (clube de desconto, SGPS, proposta, força de vendas, BI, portal de clientes…).
Frontends **Angular** (sgps-web, clube-desconto-front-a20, proposta-web, xml-contadores, clube-desconto-app/Ionic) e **React/Next/React Native**
(sgbi, representantes-web, mobi-pocket, mobi-gestao-app, portal-clientes-front, relatorios-internos). Backends **Java/Kotlin** e **Node/Nest**. Há também Rust (`linux-reshade`).
**Nenhum projeto importa a lib** hoje (`@lotexiu`), o que torna a análise honesta: é "o que cada um teve de escrever sozinho".

## 2. O que se repete (contagem de ocorrências / nº de repositórios)

| Tema | Evidência |
|---|---|
| CNPJ / CPF / CEP / telefone / IE | `cnpj` 2.541 em 32 repos · `cpf` 1.055 em 22 · `cep` 627 em 19 · telefone 2.226 em 23 · IE 120 em 20 |
| Máscaras | `mask=` em 11 repos (281): **CNPJ 16, CEP 13, CPF 11, telefone dinâmico 15, `d0/M0/0000` (data) 8, `Hh:m0` (hora) 8, `separator.2` (dinheiro) 7** |
| **CNPJ alfanumérico já em uso** | `AA.AAA.AAA/AAAA-00` em 6 pontos; `000.000.000-00‖AA.AAA.AAA/AAAA-00` (CPF ou CNPJ) em 3–4; IE `AAA.AAA.AAA-AA ‖ AA.AAA.AAA/AAAA-AA` |
| Bibliotecas de máscara/validação de documento | `ngx-mask` (8), `imask`/`react-imask` (3), `@maskito` (1), `angular2-text-mask`, `ng2-currency-mask` (3), `react-native-masked-text`, `react-number-format`, `cpf-cnpj-validator`, `@fnando/cpf`+`@fnando/cnpj`, `br-validations` — **9+ soluções diferentes para o mesmo problema** |
| Bibliotecas de data | `moment` (8 repos, 130 usos), `dayjs` (285), `date-fns` (14), `luxon` (15) **+ `new Date(` 2.709 vezes em 35 repos**. `Intl.*` só 27 vezes |
| Formato de data | `dd/MM/yyyy` domina (107 pipes), `dd/MM/yyyy HH:mm(:ss)` (~35) |
| Moeda/número | `currency:'BRL'` ~170 · `number:'1.2-2'` etc. |
| Select | `<ng-select>` 1.739 usos (sgps-web 1.083). Atributos: `bindLabel`/`bindValue`/`items` (~1.000), `multiple` 74, `clearable` 41, `searchFn` 22, `virtualScroll` 8, `notFoundMsg` 28, `appendTo` 137 |
| Tabela | `ngx-datatable` (~200): `prop/name/width/resizeable/sortable`, `scrollbarV` 148, `externalPaging` 17, `externalSorting` 18, `selectionType` 25, `limit/offset/count` |
| Paginação / debounce / tema / i18n | paginação 2.895 · debounce 537 (13 repos) · tema/dark 1.082 · i18n 1.696 |
| Validação de formulário | 4.059 ocorrências (Angular `Validators`, `zod`, `class-validator`) |

## 3. O que os projetos reimplementaram à mão (= o catálogo da lib)
- **sgps-web** (`src/app/util`, `component`): `HoraUltils` (`paraMinutos`, `deMinutos`, `normalizarDigitacao`), `CronometroUtil`, `DateField.dateFormat` (parser de data por `slice`),
  `numero-util`, `ordenacao-util` (comparador tipado), `objeto-desfazer-refazer-util`, pipes `cpf/cep/telefone-mascara`, `time-validator`;
  componentes `select`, `select-checkbox`, `sg-listagem`, `sg-filtro-coluna`, `date-input`, `input-field`, `grade`, `janela`, `modal`.
- **clube-desconto-front-a20** (`utils`, `components`): `formats.ts` (constantes `MASK_*`, `getDocumentMask(doc)`, `getPhoneMask(phone)`), `calendar-utils.ts`
  (`buildCalendarDays`, `addMonths`, `isSameDay`, `isDateInRange`, nomes de mês — **o mesmo que `Time.calendarDays`**), `debounce.ts`, `keyboard-capture/` (tabela `TKeyboardEventCode` à mão),
  `utils/filter` (`FilterItem` com `start/end`), `list` (`TListColumn`, `TListSelectMode`, `TSortDirection`), `select`, `pagination`, `active-filters`, `column-config`, `date-picker`, `ToggleBase`.
  O **estilo de tipos (`T…`) é o mesmo da lib** — é o consumidor natural.
- **javaValidationsBR** (Kotlin, seu): `isCpfValid/applyCpfMask`, `isCnpjValid` (**já alfanumérico, mód. 11, ASCII−48**), `isCEPValid`, `isPhoneValid`, `isUFValid`, **`isIEValid(uf, ie)` com 27 validadores estaduais (~1.100 linhas)**.
  Cada IE é quase só **dado**: regex de formato + lista(s) de pesos + módulo + regra do dígito (`resto>9→0`, `11−resto`, soma de dígitos…); MG é a exceção (pesos 1-2 com soma dos dígitos).

### Defeitos reais encontrados (justificam a lib)
| Onde | Defeito |
|---|---|
| `CronometroUtil.timer()` | vira o minuto quando `ss == 59` (deveria ser 60): **cada minuto dura 59 s**; idem hora. Estado e formatação misturados; sem pausa/retomada real (só `clearInterval`) |
| `DateField.dateFormat` | parser por posição de string com `alert` dentro do util (acopla UI), aceita pouquíssimos formatos, falha silenciosa |
| `HoraUltils.normalizarDigitacao` | é uma **máscara alinhada à direita** com limites 23/59 escrita sem motor — exatamente o caso que a `Mask` não cobre |
| 9+ validadores de CPF/CNPJ | mesmas regras repetidas; a maioria **não conhece CNPJ alfanumérico** (regex `\d{14}`) |
| `calendar-utils.ts` (a20) vs `Time.calendarDays` | lógica de calendário duplicada porque a da lib não é usável (acoplada a `Time`/`Date`) |
| `getDocumentMask`, `getPhoneMask` | "escolher a máscara pelo conteúdo" refeito à mão (a `Mask` tem `‖`, mas sem usar o tamanho/valor para decidir de forma testável) |

### Tema/cor
Tokens em uso (a20, sgbi, docs-web, relatorios-internos, representantes…): **vocabulário shadcn** — `background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, chart-1..5, sidebar-*` (+ `next-themes`, `class-variance-authority`, Radix em 6 repos). Não é Material nem Radix 12 passos.

## 4. Projetos externos (GitHub) — o que ensinam
**Grimoire** (mod manager de Deadlock; Electron + React 19 + TS + Zustand + SQLite; [repo](https://github.com/Slush97/grimoire), lido pelo README, `AGENTS.md` e árvore de arquivos) **[fonte]**:
- Camadas explícitas: `electron/main/services/*` (lógica) · `ipc/*` · `preload` sem lógica · `src/lib/*` (**helpers puros, a maior parte testada**) · `components/<feature>/` · `stores/` · `common/` (ui, forms, Modal, menu, ToastStack).
- **Lógica de interface separada em módulos puros e hooks**: `installed/selection.ts` + `useInstalledSelection.ts`, `installedWindowing.ts` (janela virtual), `useInstalledScrollRestoration.ts`, `browseFilters.ts`, `contentFilter.ts`, `settingsSearchIndex.ts`, `FilterCheckList`, `BrowseVirtualGrid`/`InstalledVirtualGrid`.
- Regras de domínio **testáveis sem UI**: `conflicts.ts` (mods que sobrescrevem o mesmo arquivo), fila de downloads (`download.ts`), **trava de mutação** (`withModMutationLock`/`runExclusiveModMutation` evitam corrida), **`rateLimiter.ts`** para toda API externa, perfis exportáveis por **código compacto** (`mp1:`) e arquivo JSON, ledger de importação.
- **Cor de destaque em tempo de execução** (`accentColor.ts` reescreve tokens; modo OLED troca superfícies); regra do projeto: **sem hex cru, só tokens**.
- i18n com catálogo-fonte único e *ratchet* de CI (`check-i18n`); regra "toda string visível é chave".
- Lição própria: arquivos gigantes (`Installed.tsx`, `Browse.tsx`) viram dívida; a regra do projeto é "feature nova em pasta própria, divisão só por movimento".
**Modrinth App**, **Heroic**, **Vortex**, **Jellyfin Android TV**: só li as páginas iniciais (README/árvore) — confirmam monorepo com pacotes compartilhados (`packages/`), núcleo Rust + UI web (Modrinth),
fila de download e i18n via Weblate (Heroic, Jellyfin), perfis e ordem de carga com resolução de conflitos (Vortex). **Não** extraí arquitetura interna deles; tratar como confirmação de padrão, não como fonte detalhada.

## 5. Conclusões que saem da evidência
1. **A prioridade é documentos/máscara/tempo**, não componentes bonitos: aparecem em quase todos os repositórios, em 4 linguagens (TS, Kotlin, Java, Dart/RN).
2. **O mesmo domínio existe em Kotlin e em TS** → vale **dados + vetores de teste compartilháveis** (e é o caminho natural para o Rust).
3. **Angular é o framework dominante** (e já migra para signals) → o adaptador seguinte é **Angular**, não só React; `@lotexiu/react` já existe.
4. **O consumidor natural já usa o mesmo estilo** (`T…`, `TSortDirection`, `ToggleBase`): migrar a20 para a lib é viável por etapas.
5. **Tema = vocabulário shadcn** como preset (com os papéis da lib como dado), não Material.
