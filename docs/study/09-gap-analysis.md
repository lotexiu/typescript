# 09 — Lacunas: nossas × das outras libs → o que fazer

> Cruza (a) o que **seus** repositórios mais precisam (`06`), (b) o que as pessoas fazem por falta de recurso (`08`), (c) o que **outras libs** já fazem bem ou mal.
> **[medido]** = código local · **[fonte]** = pesquisa · **[inferência]** = conclusão minha.

## 1. Onde já existe solução madura (não duplicar)
| Área | Quem já resolve | Decisão |
|---|---|---|
| Widgets headless **com a11y** (listbox, combobox, menu, dialog…) em React | React Aria, Radix, Base UI, Headless UI, Downshift, Ark | **não** reescrever a camada de a11y em React |
| Idem em **Angular** | `@angular/aria` (diretivas headless oficiais; listbox/combobox; *developer preview* desde o v21) + CDK **[fonte]** | **não** criar widgets para Angular; só ligar o núcleo (signals, máscara) |
| Tabela (sort/filtro/página/seleção/colunas) | TanStack Table (núcleo agnóstico + adaptadores) **[fonte]** | **não** reescrever; o a20 reimplementa à mão — recomendar adotar |
| Virtualização | TanStack Virtual **[fonte]** | idem |
| Posicionamento de popover | Floating UI *(conhecido, não pesquisado aqui)* | idem |
| Tempo (tipos) | Temporal (nativo em Firefox/Chrome) + `@internationalized/date` | manter **mínimo** só para o que Mask/Calendário precisam |

## 2. Lacunas **das outras libs** (onde há espaço) 
| Lacuna | Evidência |
|---|---|
| **Máscara sem DOM, com valor tipado, durações e checagens, agnóstica de framework** | IMask/Maska/Cleave são ligadas ao `<input>`; `Intl.DurationFormat` só formata (sem parse, sem digitar da direita); `ngx-mask`/`ng2-currency-mask` só Angular; 9+ soluções nos seus repos **[medido/fonte]** |
| **Lógica de estado sem DOM para plataformas sem a11y headless** (React Native, Rust, CLI) | React Aria: hooks de comportamento só web; "no RN use React Stately" **[fonte]**; `mobi-pocket`/`mobi-gestao-app` são RN **[medido]** |
| **Angular** | Zag sem adaptador oficial (só `zag-angular` da comunidade, ~28 downloads/semana) **[fonte]**; `@angular/aria` ainda em preview |
| Modelo de coleção/seleção/navegação/typeahead **desacoplado** de a11y e de framework | existem presos a React (Stately) ou a Angular (CDK `ListKeyManager`/`SelectionModel`) **[fonte]** |

## 3. Nossas lacunas (o que falta para ser **usável de verdade**)
| # | Lacuna | Por quê importa | Estado |
|---|---|---|---|
| 1 | **Cursor após formatar** (`caretAfterFormat`) | é a falha nº 1 de qualquer máscara (cursor pula, colar, IME) | **feito agora** (pura) |
| 2 | **Ligação com `<input>`** (DOM): evento `input`, composição de IME, colar, autofill | a lib nunca foi tocada por usuário real; sem isso ninguém troca `ngx-mask` | falta |
| 3 | **`@lotexiu/angular`**: diretiva + `ControlValueAccessor` de máscara, ponte de signals | Angular é o framework dominante; substitui `ngx-mask`/`ng2-currency-mask` (11 repos, 281 usos) | falta |
| 4 | Blocos nomeados com faixa por campo; negativos em número; ler texto livre (`1h30`) | casos reais dos seus utilitários (`HoraUltils`) | falta |
| 5 | Modelo de coleção/seleção/navegação/typeahead (**puro**) | base do select/listbox/combobox em RN/Angular/qualquer um | falta |
| 6 | Interop documentado com TanStack Table / zod / react-hook-form | os 12 repos que usam zod, 7 com react-hook-form | falta (receita) |
| 7 | Provider de locale (nomes de mês, separadores) | máscaras com texto, não só números | falta |
| 8 | Zero consumidores reais | nada validou a API | falta (piloto) |
| — | Tema v2, fila/mutex/limitador, hotkeys | úteis (Grimoire), mas há libs pequenas prontas | depois |

## 4. Próximo passo (decisão)
**"Máscara no mundo real"** — é o único ponto onde (1) a demanda é medida e enorme, (2) as outras libs têm a mesma falha (cursor/IME/colar), (3) o nosso núcleo já está pronto para ser consumido, e (4) cria o **primeiro consumidor real** da lib.
Ordem: **① cursor** (feito) → **② ligação com `<input>` + testes em navegador** (digitar, colar, apagar no meio, IME) → **③ `@lotexiu/angular` (diretiva/CVA) e `useMask` em `@lotexiu/react`** → **④ blocos nomeados/negativos/texto livre** → **⑤ piloto:** trocar `ngx-mask` por ele em **um** projeto (sugestão: `clube-desconto-front-a20`, que já usa o mesmo estilo de tipos) e medir o que falta.
Só depois: modelo de coleção/seleção/navegação (item 5) — **sem** reimplementar a11y onde `@angular/aria`/React Aria já a entregam.
