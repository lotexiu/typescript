# Estudos para evoluir `@lotexiu/typescript`

Pedido: ver na internet bibliotecas e referências (qualquer linguagem) para tornar a lib **mais eficiente, completa e fácil de usar**,
mantendo-a **vaga/agnóstica** (só lógica e configuração; sem HTML/CSS/DOM) e preparada para uma versão futura em **Rust**.

| Arquivo | Assunto | Estado |
|---|---|---|
| [`01-glass.md`](01-glass.md) | Custo do vidro SVG, alternativas medidas, o que foi adotado | **feito e aplicado no app** |
| [`02-mask-and-formatting.md`](02-mask-and-formatting.md) | `Mask` como porta única: duração, data, número, documentos | estudo + proposta (aguarda decisão) |
| [`03-headless.md`](03-headless.md) | Lógica de lista/select/combobox/input/calendário sem visual | estudo + proposta (aguarda decisão) |
| [`04-time-color-theme.md`](04-time-color-theme.md) | Tempo/calendário e cor/tema: o que aprender e o que é provisório | estudo + recomendação |
| [`05-rust-port.md`](05-rust-port.md) | Regras de hoje que baratem o port | notas |
| [`06-repo-analysis.md`](06-repo-analysis.md) | **Análise dos ~35 repositórios da máquina** + projetos externos (Grimoire etc.) | evidência |
| [`08-needs-and-pain-points.md`](08-needs-and-pain-points.md) | **O que as pessoas fazem por falta de recurso / por que evitam libs** + regras de design | evidência |
| [`07-decisions.md`](07-decisions.md) | **Decisões tomadas** (D1–D9) e ordem de execução | decidido |

Legenda dos documentos: **[fonte]** citado de documentação · **[medido]** rodei no código/dist · **[proposta]** recomendação minha
(onde algo não pôde ser confirmado, está dito).

## Resumo executivo
1. **Vidro**: o custo vinha de o fundo animado refazer o filtro a cada quadro e dos 3 deslocamentos da aberração — não do canvas.
   Fundo parado = custo zero; "tudo em primitivas de filtro" foi **mais lento e pior**. Aplicado: mapa vetorial, 3 níveis de qualidade, fundo animado opcional.
2. **Escopo**: nada regional (documentos, CEP, DDD…) no núcleo — só o motor genérico; regras de país vivem em pacotes de região opcionais (`@lotexiu/br` é um exemplo). 
3. **Máscara**: forte em formatos fixos da esquerda p/ direita; **não** faz duração/dinheiro (sem alinhamento à direita), nem calendário, nem dígito
   verificador, nem CNPJ alfanumérico, nem valor tipado. A proposta: `Mask` continua a porta única; por baixo, **spec em dados + codecs/presets + checksums**.
4. **Headless**: o padrão está maduro (Zag, React Aria/Stately, Downshift, TanStack, CDK, APG). Já temos as peças de baixo (`signal`, `activeIndex`, `selection`, `task`…);
   falta **coleção → navegação/seleção → listbox → select/combobox → field → calendário**, tudo sem DOM.
5. **Tempo/cor/tema**: redesenhar sobre tipos imutáveis e separados (instante × civil × duração) e sobre **papéis como dados** com contraste declarado.
   O que adicionei antes (`DateUtils.duration`, `Time.refresh`, escalas fixas do `ThemeStyle.resolve`, `onColor`, `derive`) é **provisório**.

## Roteiro sugerido (cada fase entrega algo usável)
0. ✅ Vidro.
1. **Formatação**: `Checksum` (mod11, Luhn, mod97) → `Spec` + `reversed/pad` + 3 valores → presets de duração/dinheiro/CPF/CNPJ/data. *(decide 02 §3.3)*
2. **Tempo mínimo agnóstico**: `Duration`, `CivilDate`, `CivilTime` + validação real; formatação via `Mask`. *(04)*
3. **Headless núcleo**: `collection`, `navigation`, `selection` v2 → `listbox` → `select` → `combobox`. *(03)*
4. **`field`/`form`** (usa `Mask` + `task`), depois **`calendar`/`date-field`**.
5. **Cor/tema** redesenhado (papéis como dados, contraste declarado).
6. Vetores de teste em dados (JSON) compartilháveis com a futura versão Rust. *(05)*

## Decisões (já tomadas — ver `07-decisions.md`)

As perguntas abaixo foram respondidas lá, com a evidência de `06`. Mantidas aqui como histórico.

## (histórico) Decisões que eu tinha pedido
1. `Mask`: spec em **objeto** como forma canônica + string como açúcar? (02 §3.3)
2. Headless: "props por parte" como **dados + intenções**, e **transições puras** com invólucro reativo? (03 §4)
3. Adaptador React no monorepo (`@lotexiu/react`) ou fora?
4. Tempo: aceita **não usar `Date`** por baixo (tipos próprios) e **provider** de fuso/locale? (04 §1)
5. Cor: espaço de tom **OKLCH** (simples) ou **HCT** (garantia de contraste, mais trabalho)? (04 §2)
