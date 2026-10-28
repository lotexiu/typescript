# 03 — Headless: lógica de lista, input, select e afins

> Objetivo: quem usa a lib foca no **visual**; a **lógica** (estado, teclado, foco, seleção, a11y) já vem pronta,
> sem tocar em DOM, CSS ou framework. **[fonte]** = citado · **[medido]** = verificado no código atual · **[proposta]** = recomendação minha.

## 1. O padrão e quem o pratica

[Martin Fowler — *Headless Component*](https://martinfowler.com/articles/headless-component.html) **[fonte]**: o componente headless
é "responsável só por lógica e estado, sem prescrever UI". Na lógica entram: aberto/fechado, item selecionado, índice destacado,
reação a teclas, **e também os atributos ARIA** (`role="combobox"`, `aria-expanded`, `aria-activedescendant`). A apresentação
(JSX/markup/estilo) fica com o consumidor. Recomendações do artigo: componentes dirigidos por props, **teste de transição de estado
chamando a lógica direto**, composição de peças independentes (ex.: um hook genérico de busca assíncrona).

| Projeto | Ideia central | O que aproveitar |
|---|---|---|
| [**Zag.js**](https://zagjs.com/overview/introduction) | **máquinas de estado** (statecharts) por componente, **agnósticas de framework**; adaptadores finos (React/Vue/Solid/Svelte/vanilla); cada máquina é um pacote; `machine` + `connect(api, normalizeProps)` devolve `getRootProps()`, `getItemProps(...)` | separar **máquina** (lógica) de **conexão** (props por parte); catálogo: Listbox, Select, Combobox, Date Input/Picker, Number Input, Pin Input, Tags Input, Slider, Pagination, Tabs, Tree View, Toast, Timer, Hotkeys, Focus Trap, Async List… |
| [**React Aria + React Stately**](https://react-spectrum.adobe.com/architecture.html) | **três camadas**: *state* (stately, sem DOM) → *behavior/a11y* (aria hooks) → *componente*; `@internationalized/date`/`number` agnósticos | **coleção + gerenciador de seleção** como base de tudo (`ListState`, `SelectionManager`, `selectionMode`, `selectionBehavior`, `disallowEmptySelection`, `disabledKeys`, `focusedKey`) |
| [**Downshift**](https://github.com/downshift-js/downshift) | hooks `useSelect`/`useCombobox`; **prop getters** (`getInputProps`…) que *compõem* handlers do usuário; **`stateReducer`** para alterar uma transição; **control props** (`isOpen`, `selectedItem`, `inputValue`, `highlightedIndex`) | **estado controlável de fora** e **reducer sobrescrevível** — resolve 90% das customizações sem forkar |
| [**TanStack Table / Virtual**](https://tanstack.com/table/latest/docs/overview) | núcleo TS puro + adaptadores; **qualquer fatia de estado pode ser elevada** (URL, store); *features* ativáveis (tree-shaking); `Virtualizer` decide **quais índices renderizar** e o DOM é seu | modelo de **estado possuído pelo consumidor** e de **features opt-in** |
| [**Angular CDK**](https://material.angular.io/cdk/a11y) | `ListKeyManager` (item ativo por teclado, **typeahead**, wrap configurável, pula desabilitados; variantes *FocusKeyManager*/*ActiveDescendantKeyManager*), `SelectionModel` **separado** | **foco ativo ≠ selecionado** (dois modelos independentes) |
| [**W3C APG**](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) | especificação dos padrões: **combobox** (somente-seleção, editável com lista, grid, date picker), tabela de teclado, roles/estados obrigatórios | a **fonte da verdade** do comportamento e dos atributos |

Observação: não pesquisei a fundo Radix, Base UI, Ariakit, Headless UI, Melt UI — o que está acima basta para o desenho, mas
vale conferi-los se algum detalhe (ex.: *roving tabindex*) for decisivo.

## 2. O que já existe na lib (medido)

| Já temos | Equivale a |
|---|---|
| `signal`/`computed`/`version()` | núcleo reativo (o "store") |
| `activeIndex(length, {wrap})` | `ListKeyManager` (sem typeahead, sem pular desabilitados, sem Home/End/PageUp/Down) |
| `selection<T>()` | `SelectionModel` (sem modos single/none, sem `disallowEmpty`, sem faixa/shift) |
| `toggle`, `bitFlag`, `uiInteraction` | disclosure / flags de foco-hover-active |
| `debouncedValue`, `task`, `sort` | busca com debounce, lista assíncrona, ordenação |
| `ValueHistory` | undo/redo |
| `KeyboardState`, `MouseState` | estado de teclas/ponteiro (sem bind de DOM, de propósito) |
| `Mask` | formatação de texto do input |
| `Time.calendarDays` | grade de mês (base de calendário) |

Falta o que **junta** isso em comportamentos: coleção, navegação com teclado completa, listbox, select, combobox, field/form, calendário.

## 3. Proposta  **[proposta]**

### 3.1 Princípios (para a lib continuar vaga e portável)
1. **Sem DOM, sem framework, sem CSS.** Nada de `document`, `Element`, `addEventListener`.
2. **Entrada = "intenções" e eventos neutros.** Teclado entra como `{ key, shift, ctrl, alt, meta }` (um objeto simples), não `KeyboardEvent`.
3. **Saída = estado (signals) + ações + "props por parte" como dados.** `api.part('option', key)` → `{ role:'option', 'aria-selected':true, id, onPress:'select' }` — atributos ARIA em
   forma de **objeto plano**; os handlers vão como **nomes de intenção** que o adaptador liga (React: `onClick`; Svelte: `on:click`). O adaptador é fino e fica fora da lib.
4. **Estado controlável de fora** (lição Downshift/TanStack): cada máquina aceita um `signal` do consumidor para qualquer fatia
   (`value`, `open`, `highlighted`…). Já temos isso de graça — signals são a "control prop".
5. **Transições sobrescrevíveis** (`stateReducer` do Downshift): um gancho `(state, change) => change` antes de aplicar.
6. **Transições puras** `(state, evento) → (state', efeitos)`, separadas do invólucro reativo. Ganhos: teste direto (Fowler), e **porte para Rust quase 1:1**
   (enum de estado + `fn transition`). Custo: alocação a mais que o estilo "mutar no lugar + notify" da lib → manter o caminho quente mutável
   por dentro, mas com a **interface** pura.
7. **Locale por provider** (ver `02`) e **a11y como dado** (a tabela de teclas do APG vive em dados, não espalhada em `if`).

### 3.2 Catálogo em camadas (cada camada só depende das de baixo)
```
L0  reativo            signal · computed · version · batch · ticker · task
L1  coleção            collection<T>({ items, key, label, disabled?, children? })   → itens, índice por chave, filtro/ordem derivados
L2  navegação          navigation(collection, { orientation, wrap, typeahead })     → ativo, next/prev/first/last/page, typeahead, pula desabilitado, grid 2-D opcional
    seleção            selection(collection, { mode: none|single|multiple, behavior: toggle|replace, disallowEmpty, range })
L3  listbox            L1 + L2 + seleção + a11y (roles/ids/aria-activedescendant)
    disclosure/overlay open/close, Esc, dismiss (lógica; posicionamento é geometria pura à parte)
L4  select             listbox + disclosure + rótulo/valor + typeahead com popup fechado
    combobox           select + texto digitado + filtro + modos de autocomplete (APG: none/list/both; manual × automático)
    menu · tabs · accordion · tree · tag-input · pin-input
L5  field              value(masked/unmasked/typed via Mask) · touched/dirty/focused/disabled/readonly · validação sync+async(task) · mensagens
    form               agrupamento de fields, submit, erros por campo, "dirty" global
    number-input       stepper + Mask numérica + min/max/step (aritmética decimal exata)
    calendar           grade do mês, dia focado, min/max/indisponíveis, seleção única/faixa, navegação por mês/ano  (usa o modelo de tempo, ver 04)
    date-field/-picker campos por segmento (dia/mês/ano) com Mask de campos + calendar
    slider · pagination · steps · rating · virtual-range (índices visíveis dado scroll/altura/overscan, como o TanStack Virtual)
```
**Ordem sugerida de construção** (cada etapa entrega algo usável): `collection → navigation/selection → listbox → select → combobox → field → calendar/date`.
`field` e `Mask` se alimentam: o `field` é quem "usa" a máscara e a validação.

### 3.3 Esboço (só para discutir o formato)
```ts
const list = listbox({
  items: signal(movies), key: m => m.id, label: m => m.title, disabled: m => m.soldOut,
  selection: { mode: 'multiple', disallowEmpty: false },
  navigation: { orientation: 'vertical', wrap: false, typeahead: true },
})
list.navigation.active()          // chave ativa (signal)
list.selection.selected()         // chaves (signal)
list.onKey({ key: 'ArrowDown' })  // → true se tratou
list.part('root')                 // { role:'listbox', 'aria-multiselectable':true, 'aria-activedescendant': 'opt-3', onKey:'key' }
list.part('option', 'm3')         // { role:'option', id:'opt-3', 'aria-selected':false, 'aria-disabled':false, onPress:'select' }

const sel = select({ ...list, open: signal(false) })       // sel.open é controlável de fora
const email = field({ initial:'', mask:'phone-br', rules:[required, validPhone], debounce:200 })
email.masked() · email.typed() · email.error() · email.touched()
```

## 4. Decisões que preciso de você
1. **Props como dados + nomes de intenção** (3.1-3) está bom, ou prefere a lib expor só estado e ações (sem "props por parte")?
2. **Transições puras com invólucro reativo** (3.1-6), mesmo custando um pouco de alocação?
3. **Pacote de adaptador** (`@lotexiu/react`…) fica no monorepo? (hoje a ponte vive no app.)
4. Quanto de **a11y** entra no núcleo (roles/ids/aria como dados) versus deixar 100% ao adaptador?
