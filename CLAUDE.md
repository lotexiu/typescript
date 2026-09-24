# CLAUDE.md

Contexto do projeto para auxiliar Claude em sessões de desenvolvimento.
Atualizar incrementalmente conforme decisões são tomadas — não reescrever em bloco.

---

## O que é este projeto

`@lotexiu/typescript` é uma lib TypeScript de primitivos universais agnósticos de framework, publicada no npm. Cobre os problemas mais comuns no desenvolvimento de software: reatividade, estado, máscaras, parsing, utilitários de string, temas, variantes, histórico de valores, etc.

O objetivo é publicar uma versão estável que precise apenas de manutenções pontuais após o lançamento. Existe uma versão antiga considerada defeituosa — este projeto é uma reescrita completa deliberada.

**Bar diferente de um app repo:**
- Estabilidade e previsibilidade da API pública importam mais que em código de aplicação — cada export é superfície que consumidores dependem
- Zero/near-zero dependências de runtime — apenas `colorjs.io` é dependência real
- O projeto ainda está tomando forma — convenções abaixo são o padrão alvo atual, não definitivo. Código que não segue uma convenção é drift pré-existente, não licença para inventar um terceiro padrão
- **O autor faz reescritas em escala, de propósito, quando algo para de "parecer certo"** — não é acidente nem instabilidade. Quando isso acontece, é comum um módulo inteiro (estrutura, testes, documentação) ser deletado em bloco — mas **"deletado" não significa a mesma coisa toda vez**: às vezes é permanente (o código não volta, o conceito foi descartado), às vezes é intencional-pra-refazer-diferente (o conceito continua válido, só a forma vai mudar quando for reconstruído). De fora não dá pra saber qual dos dois é sem perguntar — não presumir nenhum dos lados. Testes e docs, especificamente, tendem a voltar só quando a forma nova estabilizar, não junto com a reescrita. Ver "⚠️ Este arquivo pode estar desatualizado" logo abaixo e em "Mantendo este arquivo" no final.

### ⚠️ Este arquivo pode estar desatualizado — e isso é esperado, não um bug do processo

CLAUDE.md descreve o estado do projeto **no momento em que foi escrito**. Depois de uma reescrita em escala (ver bullet acima), partes inteiras deste arquivo podem não bater mais com o código — módulos documentados aqui podem ter sido deletados, testes/docs podem ter sumido de propósito para voltar depois, convenções podem ter mudado. **Isso não significa que o arquivo está "errado" ou que precisa virar verdade absoluta — significa que numa conversa nova, antes de agir sobre uma afirmação estrutural (existência de um módulo/arquivo, cobertura de teste, comando de um script), vale a pena checar rápido (`ls`, `grep`, ler o arquivo) em vez de assumir.**

O que tende a ficar estável mesmo entre reescritas (pode confiar direto): filosofia, convenções de nomenclatura/arquivo, critérios de qualidade, "o que NÃO fazer", histórico de bugs (o padrão do bug tende a se repetir mesmo que o arquivo específico mude).
O que é mais volátil (checar antes de confiar): a árvore de "Estrutura de módulos", afirmações de "X não existe mais"/"Y foi removido", presença/ausência de testes e docs, comandos exatos em `package.json`.

**"Removido" tem dois sentidos possíveis, e não dá pra saber qual de fora:** às vezes é definitivo — o conceito foi descartado, não volta. Às vezes é intencional-pra-refazer-diferente — o conceito continua válido, só a implementação vai mudar de forma quando for reconstruído. As notas de "X foi removido" espalhadas por este arquivo (sistema de plugins, reactive proxy, `ValueCell`/`VariantCell`, etc.) registram **que sumiu e quando**, não qual dos dois casos é — isso só o autor sabe com certeza. Não assumir nenhum dos lados: nem que vai voltar igual, nem que morreu de vez. Se a resposta importar pra uma decisão (ex.: vale a pena reconstruir algo parecido agora?), perguntar em vez de supor.

Estado registrado nesta revisão (2026-08-25, branch `clean-code`, commits `temp`): módulos inteiros do `master` foram removidos — `html/` (managers de tema + sistema de plugins inteiro: `MaskPlugin`, `NumberPlugin`, `AsyncCheckPlugin`, `ValidationPlugin`, registry), `capture-manager/`, `palette/` (top-level, virou `theme/palette/`), `rule-factory/`, `value-cell/`, `variant-cell/`, `natives/object/proxy/`, `natives/validation/`, `spy/`, `time/`, `path-map/`. Confirmado via grep: zero referências remanescentes a esses caminhos em `src/`, e `src/index.ts` (gerado) não tenta exportar nada deles. **Não há testes nem docs de nível de módulo neste momento, de propósito** — e **desde 2026-08 não há `*.test.ts` nenhum no repo**: as suites de `scripts/tools/` foram deletadas junto com os próprios scripts (ver "Removido em 2026-08" em Comandos). `Mask`, `_String`, `Parser`, etc. nunca tiveram suite própria. Não trazer nada disso de volta especulativamente (mesma regra de "Decisões técnicas" para código removido de propósito) — e não estranhar a ausência de testes/docs como se fosse descuido.

---

## Estrutura de módulos

```
src/
  filters/            — debounce, throttle, step, once
  global/             — extensões de prototype nativas (_Global.register)
  field/              — field/readField — derived sobre parte de um signal (field também escreve de volta)
  item/               — Item<V> — item reativo genérico (id, label: TReadable, value: TSignal)
  mask/               — Mask — formatação/validação por máscara (classe totalmente static)
    token/            — TMaskToken / TMaskRuleToken — tokens compilados de um pattern
  natives/
    array/            — ArrayUtils
    class/            — instanceOf/ClassUtils + Timeout (construtor NodeJS.Timeout recuperado)
    date/             — parseISO (estrito, valida calendário real) + formatMS
    function/         — _Function (thisAsParameter, rebind, negate)
    math/             — _Math / MathUtils
    number/           — _Number / NumberUtils
    object/           — _Object / ObjectUtils
    regex/            — REGEX_PATTERNS, _Regex (escapeReservedKeys, hasAstralChar)
    string/           — _String, utilitários de string
  parser/             — parser de escopos genérico configurável
  signal/             — núcleo reativo: signal/derived (fachada) + ReactiveNode (@internal, o grafo)
  state/
    keyboard/         — KeyboardState (signal de Set mutado no lugar + notify)
    mouse/            — MouseState<Buttons> (idem — capture-manager foi removido/inlined)
  stopwatch/          — medição de tempo/performance
  subscription/       — Subscription<T> (emissor sem valor) + ListenerUtils (@internal, armazenamento de listeners)
  theme/              — Theme (mode + style, dois signals simples)
    palette/          — Palette / CustomPalette / TonalPalette (cache de tons = derived da seed) + presets.ts (PALETTES)
    style/            — ThemeStyle, SlotColor
  value-history/      — ValueHistory<T> (undo/redo, construído sobre signal/derived)
  variant/            — Variant<K,V> — chave → valor derivado (chave muda → recomputa)
  declarations.ts     — monkey-patch de prototypes nativos (@required, não exporta)

.old/                 — (na raiz do pacote, não em src/) Model/Computed/Subscription antigos, arquivados em
                        2026-09-24 na troca pelo núcleo signal/derived. Fora de `src/` porque o tsconfig inclui
                        `src/.*/**/*` (pastas com ponto dentro de src/ SÃO type-checked). Só referência.
```

---

## Comandos

```bash
pnpm build          # pnpm clean && vite build → dist/ (ESM + UMD/CJS + bundled .d.ts)
pnpm clean          # rm -rf dist
pnpm test           # vitest run --passWithNoTests (não há suites hoje, de propósito)
pnpm test:watch     # vitest watch mode
pnpm test:ui        # vitest UI
pnpm docs:ast       # tsx scripts/doc/generate.ts → docs/EXTRACTED.md (extração sintática via src/language + TypescriptLang)
```

**Removido em 2026-08** (branch `clean-code`): `scripts/analyzer/` (todo o `AnalyzerProject` sobre `ts.Program`), `scripts/tools/` inteiro (`index-generator`, `validator`, `docs-generator`, `api-snapshot`/`api-diff`/`api-signature`/`generate-changes`) e o workflow `pr-analysis.yml`. Sobrou `scripts/doc/` (AST próprio) + `scripts/vite-plugin.ts`. Não há mais `pnpm run docs`, `pnpm changes`, `pnpm changes:check`, `pnpm ast:example`. Versionamento semântico por diff de API foi descartado — bump/tag voltaram a ser manuais (`docs/guide/release.md`).

Não há mais `pnpm dev`/`pnpm debug` — pra watch mode, rodar `vite build --watch` direto (`scripts/vite-plugin.ts` reage a `config.build.watch`, ver "Armadilhas do watcher" abaixo).

**Não há nenhum `*.test.ts` no repo hoje, de propósito** — as suites dos scripts foram deletadas junto com os scripts; `Mask`/`_String`/`Parser` nunca tiveram suite própria. `pnpm test` passa vazio (`--passWithNoTests`).

Scripts em `scripts/` **não são type-checked pelo `tsc -p tsconfig.json`** (include é só `src/**/*`). A única verificação real é rodá-los: `pnpm build` (exercita `scripts/doc/index-gen.ts` via `scripts/vite-plugin.ts`) e `pnpm docs:ast`.

---

## Aliases de import

| Alias | Target |
|---|---|
| `@ts/*` | `src/*` |
| `@tsn/*` | `src/natives/*` |
| `@tsn-string/*` | `src/natives/string/*` |
| `@tsn-object/*` | `src/natives/object/*` |
| `@tsn-function/*` | `src/natives/function/*` |
| `@tsn-regex/*` | `src/natives/regex/*` |
| `@tsn-math/*`, `@tsn-number/*` | `src/natives/<name>/*` (parcial) |

Sempre importar via alias ao cruzar boundaries de `src/natives/<x>/`. Dentro de um mesmo diretório de módulo, imports relativos são o padrão.

---

## Convenção de arquivos por módulo

| Arquivo | Papel |
|---|---|
| `types.ts` | Exports de tipo puro (prefixo `T`). Sem código runtime. |
| `types.native.ts` | Re-derivações de builtins TS — só em `natives/object` |
| `implementations.ts` | A lógica real. Classe `_Foo` com `static` methods, tagged `@internal` — **modo antigo**, ver nota abaixo |
| `utils.ts` | Classe `FooUtils` de statics. **Modo novo (preferir):** a lógica direto aqui, sem `_Foo` nem `implementations.ts`. Modo antigo: só o wrapper público que delega para `_Foo`. |
| `model.ts` / `declarations.ts` | Classes com estado, singletons, constantes |

**Regra do split `_Foo`/`FooUtils`:** aplica-se a **classes de utilitários estáticos** (sem `new`, só static methods). **Não** aplica-se a **classes instanciáveis com estado** (`ValueHistory`, `Item`, `KeyboardState`, `MouseState`) — essas são exportadas diretamente. Ao adicionar um módulo novo: "é um namespace de static methods ou uma coisa instanciável com estado próprio?"

**Atualização 2026-08-27 — o split `_Foo` + `FooUtils` está sendo aposentado para módulos novos.** O autor considera `_Foo` redundante: um único `utils.ts` com `class FooUtils { static ... }` (statics diretos, chamadas entre irmãos sempre via `FooUtils.x` nunca `this`, superfície controlada por `@internal`/JSDoc) substitui `implementations.ts` + `utils.ts`. Free functions exportadas soltas também saem — vira tudo static da classe, um único export. Primeiro exemplo: `src/language/utils.ts` (`LanguageUtils`) — o exemplo original, `src/ast/grammar/utils.ts` (`GrammarUtils`), foi removido em 2026-09-14 junto com o motor antigo (`src/ast/grammar/` + `src/lexer/`, superados por `src/language/`). Módulos antigos com `implementations.ts` separado são drift pré-existente, não migrar especulativamente. (O basename fica `utils` no plural — cogitou-se `util` singular e desistiu-se.)

**Caso cinzento a observar: `Mask`.** Depois da reescrita em `mask/model.ts`, `Mask` é totalmente static (sem `new Mask()`, cache + `signal<Map>` de regras como estado de classe) mas não segue nem `_Foo`/`FooUtils` nem o padrão de instanciável-com-estado — é exportada direto como `Mask` (igual `model.ts`/`declarations.ts` da tabela acima: "singleton"). Não é necessariamente um erro, mas é uma terceira forma que a regra atual não cobre explicitamente — vale perguntar ao autor se isso deveria virar uma terceira categoria nomeada, em vez de inventar por conta própria.

**O projeto está em migração:** classes `_Foo` que ainda são object literals estão sendo convertidas para `class _Foo { static ... }`. Ao encontrar um `_Foo` que ainda é object literal, é essa migração em andamento, não uma convenção diferente.

---

## Convenções de nomenclatura

- Tipos/interfaces sempre prefixados com `T` (ex: `TMaskCompiled`, `TPlugin<T>`)
- Classes internas: `_Foo` + tag `@internal`
- Wrappers públicos: `FooUtils`
- Singletons de manager: camelCase (`keyboardManager`, `mouseManager`, `hotkey`)

---

## Módulos reativos

Reescritos em 2026-09-24 (branch `clean-code`): `Model`/`Computed`/`SubscriptionController` saíram (cópias em `.old/`), tudo passou a ser construído sobre `src/signal/`. Modelo push-pull com versões, o mesmo do Angular (`@angular/core/primitives/signals`), com diferenças medidas — ver "Decisões de performance do núcleo reativo" abaixo.

### `signal(initial, equal?)` / `derived(compute, equal?)` — `src/signal/model.ts`
- **Instância é uma função**: `s()` lê. Não existe `.value` (decisão do autor: uma forma só). Métodos são propriedades da função: signal tem `set`/`update`/`notify`/`subscribe`/`dispose`; derived tem `subscribe`/`dispose`. Tipos: `TSignal<T>`, `TDerived<T>`, `TReadable<T>` (o que os dois têm em comum) em `src/signal/types.ts`.
- **Dependências automáticas**: ler um signal/derived dentro do `compute` de um derived registra a dependência (`activeConsumer`). Não existe mais lista manual de dependências (`Computed.setDependencies`, parâmetro `dependencies` de `field`) — quem precisava ler algo só para registrar dependência lê explicitamente (ex.: `Parser._root` lê `configVersion()`).
- **`derived.subscribe(fn)`** recebe o **valor** e só é chamado quando ele **muda de fato** (recalcula na hora para comparar). Diferente do `Computed` antigo, que avisava a cada mudança de dependência, mesmo sem mudar o valor, passando a si mesmo. Listeners rodam depois que a propagação termina (ou no fim do `Signal.batch` mais externo); um listener com erro não impede os outros.
- **Escrever (`set`/`update`/`notify`) durante o `compute` de um derived lança erro** (`SIGNAL_LOCALES.writeInDerived`), como o Angular. Efeito colateral vai em `subscribe`. Escape: `Signal.untracked(() => s.set(x))`.
- `Signal.batch(fn)`, `Signal.untracked(fn)` (ou `Signal.untracked(s)` direto), `x instanceof Signal`/`Derived`.
- Métodos da fachada usam `this` (como métodos de classe) — `const { set } = s` não funciona. `field` usa closures de propósito (extraível).

### `Subscription<T>` — `src/subscription/model.ts`
Emissor de eventos **sem valor guardado** (`subscribe`/`notify`/`dispose`, tudo público). Para estado, usar `signal`. Listeners guardados por `ListenerUtils` (sem `Set`: `undefined` / a função / array copy-on-write) — o mesmo armazenamento do `ReactiveNode`.

### `field(source, get, set)` / `readField(source, get)`
Derived sobre parte de um signal; `field` escreve de volta mutando a fonte no lugar + `source.notify()`.

### `Variant<K,V>`
Classe: `key()`/`value()` (leituras reativas), `set(key)`, `prevKey`/`prevValue` (não reativos), `subscribe(fn)` (valor). `prevValue` saiu do núcleo e vive só aqui.

### `ReadonlyValue<T>` — mantido como classe com `.value`
Não é reativo (calcula uma vez e guarda). Medido em 2026-09-24: a classe (104 bytes) é **menor e mais rápida** que uma closure equivalente (168 bytes, leitura 2x mais lenta — closure com variável mutável aloca um objeto de contexto extra). Não trocar por closure.

`ValueCell<T>` e `VariantCell<TName, TValue>` **não existem mais** — removidos junto com o sistema de plugins (`html/plugins/`) que era o único consumidor de `ValueCell`; `VariantCell` (o padrão "nome ativo + valor derivado cacheado, dois eixos independentes") não tem substituto direto hoje — `Theme` (`src/theme/model.ts`) usa dois signals simples (`mode`, `style`) em vez disso. Se o padrão de dois eixos independentes for necessário de novo, ele precisa ser reconstruído, não presumido presente.

### Decisões de performance do núcleo reativo (medidas em 2026-09-24, não refazer sem motivo novo)
- **Fachada = closure `() => node.read()` + métodos como propriedades próprias.** Testado contra: classe com `Object.setPrototypeOf` numa função (~10x mais caro de criar), `.value` como getter via `defineProperty` (mesmo custo), `bind` com prototype herdado (3x mais lento de criar, leitura 4.7x mais lenta) e `bind` puro sem métodos, estilo alien-signals (cria 2.5x mais rápido, mas **leitura 2.7x mais lenta** — leitura é o caminho quente, criação acontece uma vez).
- **Grafo em `ReactiveNode`, uma classe só para fonte e derivado** (formato único → acessos monomórficos). Estado de objeto-função é ~1.7x mais lento de escrever que de instância comum, por isso nada do grafo fica na fachada.
- **Booleanos do nó = bits em `#flags`** (`NODE_FLAGS` em `signal/declarations.ts`).
- **Dedup de leitura repetida** (`a() + b() + a()` cria 2 links, não 3) via `#runId`/`#trackedInRun`: −35% de memória nesse caso, ~5% mais lento numa cadeia não viva (a checagem roda em toda leitura rastreada).
- **Juntar `#recompute` dentro de `#refresh` para economizar quadro de pilha não aumentou a profundidade máxima** (5500 nos dois casos — o quadro que sobra fica maior). Por isso ficaram separados.
- **Profundidade:** a 1ª leitura de uma cadeia não viva recursa um nível de pilha por derived (limite ~5500 no Node). Inerente a qualquer modelo pull preguiçoso (Angular tem o mesmo) — o cálculo de um nível chama o anterior. A propagação (push) é iterativa e não tem esse limite.
- Benchmarks, fuzz com oráculo e casos de borda usados nessa rodada ficaram em `.tmp/` (fora do git, pode ter sido apagado).

---

## Filosofia de performance reativa — mutar in-place, notificar manualmente

Esta lib **não é obrigada a reproduzir a convenção de update imutável do React/Angular**. `signal.notify()` existe especificamente para que um consumidor possa mutar o objeto que um signal já guarda in-place e avisar diretamente, sem clonar para um novo objeto só para passar no `Object.is` do `set()`.

```ts
// preferir:
this.buttons().add(button)
this.buttons.notify()

// evitar (aloca objeto novo em cada chamada sem benefício):
this.buttons.set(new Set([...this.buttons(), button]))
```

**Exceção real:** ao bridgear para algo que gatea re-renders em identidade de referência (ex: `useSyncExternalStore` do React), produzir referência nova **naquele boundary específico**, não mudando como a lib atualiza seu estado interno.

---

## `_String` — utilitário de string nativo

### Regras críticas de Unicode

| Tipo | Exemplo | `.length` |
|---|---|---|
| ASCII / BMP | `a`, `é`, `中` | 1 |
| Surrogate pairs | `😀`, `𝄞` | 2 |
| ZWJ sequences | `👨‍👩‍👧` | 8 |
| Variation selectors | `❤️` | 3 |
| Bandeiras | `🇧🇷` | 4 |

### Estratégia híbrida de performance

A detecção de astral chars não vive mais em `_String` — foi centralizada em `_Regex.hasAstralChar()` (`src/natives/regex/`), reusada tanto por `_String` quanto por `Mask`:

```ts
// natives/regex/declarations.ts
UNICODE: { HIGH_SURROGATE: '[\\uD800-\\uDBFF]' } // só high surrogate — se tem um, é astral

// natives/regex/implementations.ts
static hasAstralChar(value: string): boolean { return _Regex.highSurrogateRegex.test(value) }

// natives/string/implementations.ts
private static readonly SEGMENTER = new Intl.Segmenter(); // instância estática única
```

- Sem astral chars (`!_Regex.hasAstralChar(str)`) → caminho rápido com indexação direta (~200x mais rápido que Segmenter em ASCII)
- Com astral chars → `SEGMENTER.segment(str)` para iterar por grafemas
- `forEach(str, callback)` chama `callback(char, index, size)` — `size` é a largura do grafema em code units (1 BMP, 2+ surrogate pair/ZWJ). `onChar(chars)` retorna uma função `(str, callback)` com `callback(index, size)` na mesma lógica — ver `TStrForEeachCallback`/`TStrOnCharCallback` em `types.ts`

### Métodos intencionalmente de baixo nível (code units UTF-16)
`charCodeArray`, `lookupArray`, `lookupArray128` — **não alterar para grafemas**, são de baixo nível por design. Documentar com `@internal` ou JSDoc indicando que operam em UTF-16 code units.

### Bug de flag `u` corrigido (2026-08-11)
Regexes com `\p{...}` (property escapes) sem flag `u`/`v` silenciosamente não funcionam — `\p{L}` sem `u` é parseado como literais `p{L}`. Predicados de caractere (`isLetter`, `isLowerCase`, `isUpperCase`, etc.) têm parâmetro `extended: boolean = false`: `false` usa ASCII/charCodeAt (rápido), `true` usa `\p{...}` com flag `u` (opt-in).

### Bug de `this` em chamadas entre static methods (2026-07-17)
Static methods que chamam um sibling via `this.outroMetodo()` em vez de `ClassName.outroMetodo()` quebram quando o método é extraído como referência bare. **Sempre usar o nome explícito da classe em chamadas internas**, nunca `this`. Afetou `_String`, `_Object`, `_Function`.

---

## `Mask` — máscara de string

### Regras padrão

| Token | Aceita |
|---|---|
| `0` | dígitos básicos |
| `A` | dígitos + letras |
| `W` | letras |
| `U` | maiúsculas |
| `L` | minúsculas |
| `S` | símbolos |
| `C` | moeda |
| `E` | emojis |
| `X` | qualquer char |

Quantificadores: `0{3}`, `0{1,3}`, `0{1,}` ou `0*`, `0?`
Alternativas: `||` (ex: `(00) 00000-0000||(00) 0000-0000`)

### API atual — `Mask` é uma classe totalmente static (sem `new Mask()`)
`Mask.apply(value, mask)`, `Mask.unapply(value, mask)`, `Mask.valid(value, mask)` — todos static, chamados direto na classe. Não existe `MaskUtils` no módulo ativo hoje (ver nota sobre `.old-mask/` abaixo).

Gerenciamento de regras (também static): `Mask.setRule(key, rule)` (substitui o antigo `setToken`), `Mask.resetRulesToDefault()`, `Mask.clearRules()`. `Mask.rules` é um `derived` com os valores registrados (array), `Mask.ruleKeys` um `derived` com as chaves — ambos recomputam quando o `signal<Map>` interno de regras muda; mudar regras invalida o cache de patterns compilados automaticamente (`Mask._rules.subscribe(() => Mask.cache.clear())`).

### Tokens compilados (`src/mask/token/`)
Um pattern (`mask.split('||')`) compila para uma lista de `TMaskToken` (literal) / `TMaskRuleToken` (regra, com `min`/`max`/`test: RegExp` pré-compilado) — classes reais em `token/model.ts`, não mais a union discriminada `{type: 'mask'|'rule', ...}` de antes. Distinguir com `instanceof`, não `.type`. `TMaskCompiledPattern` guarda `tokens` (ambos) e `ruleTokens` (só as regras, pré-filtrado, usado por `unapply`).

### Surrogate pairs
- `apply` — caminho rápido para strings sem astral chars; com astral chars, monta os tokens sobre `[...raw]` (array de code points) em vez de indexar a string crua
- `valid` — detecta astral chars via `_Regex.hasAstralChar` e avança por `codePointAt`/`String.fromCodePoint` em vez de `value[index]` cego quando precisa
- `unapply` — `for...of` correto para code points

### `caretPositionAfterFormat` — não existe no módulo ativo
Vivia em `MaskUtils.caretPositionAfterFormat(previousDisplay, previousCaret, nextDisplay, mask)`: contava chars "raw" antes do caret no texto antigo e achava onde esse count era atingido no novo texto (parte DOM ficava no consumidor). Essa implementação só existe hoje em `src/.old-mask/` (arquivado, fora do build — ver "Estrutura de módulos"). Se o comportamento ainda for necessário, precisa ser reportado para o novo `Mask` — não assumir que já foi.

---

## `Parser` — parser de escopos

Parser genérico e configurável. **Não** é um parser de linguagem específica — reconhece apenas delimitadores (gates) e constrói uma árvore de escopos. Semântica fica a cargo de quem usa.

### `ParserGate`
- `open`/`close` — strings de 1 ou mais chars
- `opaque` — conteúdo interno ignorado (strings, comentários)
- `symmetric` — `open === close`

### Performance atual
- Lookup via `Uint8Array[128]` — early exit para ~94% dos chars
- `multiCharGates` separado para gates de 2+ chars

### Refatoração planejada
Ver `PROMPT-parser-refactor.md` para o prompt completo. Resumo:
- `_changed`/`_processed` manual → `signal<string>` + `derived<ParserRoot>` (**feito** em 2026-09-24: `text` é signal, `root` é derived)
- `ParserRoot.text: signal<string>` como fonte única da verdade (flyweight)
- `ParserNode.content` e `ParserGap.text` — extraídos lazy (hoje via `ReadonlyValue`)
- Adicionar `ParserGap` para intervalos entre nós
- `children` (typo `childrens` corrigido), `unclosed: boolean` explícito
- `closeOf` — remover (nunca lido)
- Referência ao `Parser` inteiro em `ParserNode` → apenas `ParserRoot`

---

## `src/language/` + `TypescriptLang` (`src/ast/ts/`)

`src/language/` é o motor de gramática declarativo da lib — substituiu por completo o motor antigo (`src/ast/grammar/` + `src/lexer/`, removidos em 2026-09-14 junto com a conclusão do `TypescriptLang`: lexer e gramática separados viraram uma única `TLanguageSpec`). Uma `TLanguageSpec` só declara `scope`/`delimited`/`charClass`/`literal`/`grammar`, e `Language.define(spec).parse(source)`/`.analyze(source)` fazem tudo (tokeniza + roda a gramática). Combinadores em `G` (`src/language/grammar.ts`): `tok`/`val`/`seq`/`choice`/`many`/`opt`/`sepBy`/`field`/`ref`/`node` básicos, mais `into` (desce num escopo aninhado do `Parser` — aceita nome de regra registrada **ou** uma regra inline, `G.into("paren", G.sepBy(item, val(",")))`), `placeholder` (casa o escopo sem descer), `build` (constrói `AstNode` de baixo nível fora do fluxo normal), `binary` (cadeia binária esquerda-associativa achatada — 1 nó por nível, não 1 por operador) e `chain` (encadeamento postfix tipo `a.b().c` — cada `step` recebe o nó já construído e decide como envolvê-lo).

`TypescriptLang` (`src/ast/ts/declarations.ts` + `grammar-shared.ts`/`grammar-type.ts`/`grammar-expr.ts`/`grammar-stmt.ts`/`grammar-decl.ts`) é uma espec real de TypeScript sobre esse motor — não mais só "declaração top-level + `declTail` que pula o corpo" (isso foi a v1; virou uma reescrita completa em 2026-09-14): tipos (union/intersection/generics/mapped/condicional/tupla/função), expressões (precedência completa, arrow functions, template literals, optional chaining, generics em chamada), statements (`if`/`for`/`for-in`/`for-of`/`while`/`switch`/`try`), declarações com corpo real (classe com membros/decorators/heritage, interface, enum, namespace, `import`/`export` em todas as formas comuns). Cada `grammar-*.ts` só referencia as outras por nome (`G.ref`), nunca importa o objeto — sem risco de ciclo de import. `scripts/doc/extract.ts` (usado por `pnpm docs:ast`) consome essa gramática real: toda declaração de topo é `AstNode.kind === "Declaration"` com campo `kind` (a keyword) e `name` (ou `declarators` pra `const`/`let`/`var`, com `BindingName` podendo ser `ObjectPattern`/`ArrayPattern` — `collectBindingNames` em `extract.ts` desce recursivamente). Smoke test (não vitest, ver nota de testes no topo do arquivo): `src/.test/typescript-lang.ts`, rodável direto via `tsx`.

**Limitações aceitas de propósito** (documentadas também no JSDoc de `declarations.ts`): sem regex literal (`/…/` ambíguo com divisão sem lookback no `Parser` atual), sem `>>`/`>>>`/`>>=`/`>>>=` (colidiria com fechamento de generics aninhados, `Array<Array<T>>`), sem JSX, ASI não simulada, e uma palavra "quase-reservada" (`as`, `type`, `satisfies`, `get`, `set`, `of`, ...) não pode ser usada como nome de binding mesmo sendo legal em JS de verdade.

---

## `src/language/` — ideias de evolução (backlog, não implementar sem pedir)

Registrado em 2026-08-31 (então sobre o motor antigo `src/lexer/`+`src/ast/grammar/`; atualizado em 2026-09-14 pros caminhos de `src/language/`, que o substituiu por completo — as duas ideias abaixo continuam válidas porque o comportamento subjacente não mudou na reescrita). **Não implementar nada disso especulativamente** (mesma regra de "Decisões técnicas") — só serve pra não perder a ideia.

- **Toggle explícito pra incluir `"unknown"` no trivia.** Hoje `"unknown"` é o fallback hardcoded de `LanguageUtils.#scanGap` (`src/language/utils.ts`) pra qualquer char sem `charClass`/`literal` que bata — não é uma trivia registrada, então nunca é filtrado por `keepTrivia`. Ideia: um jeito explícito de opt-in pra tratar `"unknown"` como trivia sem precisar registrar uma `charClass` fake — junto com reservar `"unknown"` como nome proibido em `charClass`/`literal`/`delimited` (erro se uma `TLanguageSpec` tentar usar esse nome), pra não colidir com o fallback do próprio motor. Motivação: tratar todo `"unknown"` como trivia é útil às vezes, mas perigoso por padrão — ele agrupa qualquer conteúdo real ainda não classificado, não só formatação; descartar do stream sem querer pode criar falsa adjacência entre tokens que na verdade estão longe um do outro no source.
- **Expor `ctx.furthest` no retorno de `Language.parse`/`analyze`.** Já é rastreado internamente (`TLangCtx.furthest`, atualizado em `G`'s `#fail`, `src/language/grammar.ts` — posição de token mais distante em que algum matcher falhou) mas não é exposto pra fora — `parse`/`analyze` (`src/language/model.ts`) só devolvem `AstRoot`/`TAnalysis` sem esse dado. É a base natural pra diagnóstico de erro sintático estilo "unexpected token at position N". Cobriria só erro *sintático* — erro semântico exigiria um type checker em cima da AST, escopo bem maior.

---

## Build e geração de código (ler antes de adicionar arquivos)

**`src/index.ts` é código gerado, não escrito à mão.** Nunca editar manualmente — qualquer mudança é sobrescrita no próximo build.

- Adicionar módulo = criar arquivo(s) em `src/`, exportar símbolos normalmente, rebuild — sem wiring manual
- `@required` (comentário standalone, não JSDoc) — força import por side-effect no entry gerado (usado por `src/declarations.ts`)
- `@internal` — exclui do `src/index.ts`

### Arquitetura dos scripts (pós-remoção do analyzer, 2026-08)

Tudo roda sobre `src/language` (`TypescriptLang`, `src/ast/ts/`) + `src/ast/node` — zero compiler API do TS.

- `scripts/doc/extract.ts` — `extractSource`/`extractFile`/`walkSourceFiles`: extração puramente sintática de um `.ts` (declarações top-level, `export { }`, `declare global`, `@required`)
- `scripts/doc/index-gen.ts` — `buildIndex`/`writeIndex`: gera `src/index.ts`. Rodável direto (`tsx scripts/doc/index-gen.ts`)
- `scripts/doc/generate.ts` — `pnpm docs:ast` → `docs/EXTRACTED.md`
- `scripts/doc/tsconfig-alias.ts` — lê `paths` do `tsconfig.json` → alias de Vite/Vitest (substituiu `AnalyzerProject.resolvedAlias()`)
- `scripts/vite-plugin.ts` — `indexGenPlugin`: no `buildStart` roda `scripts/doc/index-gen.ts` num processo `tsx` separado (o loader de config do Vite não resolve os aliases `@ts/*`) + chokidar em `src/` pra pegar arquivo novo no watch

### Armadilhas do watcher (chokidar)
- **chokidar v4 removeu suporte a globs** — passar `src/**/*.ts` silenciosamente não observa nada. Observar o diretório e filtrar por extensão no handler
- **`writeFile` incondicional = loop infinito** — `src/index.ts` é o entry point, está no graph do Rollup. Escrever byte-identico bumpa o mtime e re-trigga o build infinitamente. `scripts/doc/write-if-changed.ts` pula a escrita quando o conteúdo não mudou — não remover esse check

---

## Geração de documentação

`pnpm docs:ast` gera `docs/EXTRACTED.md` — uma seção por arquivo, cada declaração top-level com kind, flag exported/local, linha e o JSDoc parseado. Extração sintática pura, sem type-checker. (O gerador antigo `docs-generator.ts` — `docs/modules/*.md` + `PROJECT.md` + `API.md`, sobre o compiler API — foi removido.)

**Não adicionar JSDoc proativamente** como subproduto de trabalho não relacionado — o autor quer pensar em uma estratégia de documentação antes de acumular comentários ad-hoc.

---

## Sistema de plugins — REMOVIDO (`src/html/plugins/` não existe mais)

Existiu um sistema de plugins agnósticos de framework (`MaskPlugin`, `NumberPlugin`, `AsyncCheckPlugin`, e um `ValidationPlugin` já removido antes disso) inteiro descrito aqui — `html/` foi removido por completo na reescrita da branch `clean-code` (junto com `capture-manager/`, `value-cell/`, `natives/validation/`; ver "Branch `clean-code`" no topo do arquivo). O raciocínio de design original (adapter vs. logic plugin, type vs. modifier plugin, plugins nunca referenciam plugins-siblings, validação não é plugin) pode ainda ser válido **se** o sistema for reconstruído — mas não há código nenhum disso ativo hoje. Não presumir que `MaskPlugin`/`ValueCell`/etc. existem sem checar.

---

## Extensão de prototypes nativos

Padrão em `src/declarations.ts` + `src/global/`:
1. `src/<type>/types.ts` declara o tipo da função
2. `src/natives/<type>/implementations.ts` implementa a lógica
3. `src/declarations.ts` tem `declare global { interface Foo { ... } }` + chama `_Global.register(Foo, { methodName: _Fn.methodName.thisAsParameter() })`
4. `_Global.register` faz o `Object.defineProperty` no prototype

Se adicionar extensão nova: seguir os quatro passos — `declare global` sem `_Global.register` (ou vice-versa) compila mas não funciona em runtime.

---

## Reactive proxy — REMOVIDO (`src/natives/object/proxy/` não existe mais)

Existiu um `Proxy` reativo (`proxyHandler`/`deleteProxy`, com callbacks `onChanges`/`onSet`/`onGet`) descrito aqui em detalhe, incluindo dois bugs corrigidos no rebuild de 2026-07-17 (cache de nested proxy desatualizado em reassignment; `allProxy: true` não cascateando). O módulo inteiro foi removido na reescrita da branch `clean-code` — zero referências restantes em `src/`. Não presumir que existe sem checar.

---

## Temas e paletas de cor

- **`colorjs.io`** — única dependência de runtime (confirmado em `package.json`, `^0.6.1`). Justificada pela complexidade real: conversões entre espaços de cor (`oklch`, `lab`, `display-p3`), gamut mapping, variation selectors, formatos múltiplos. Mantida por Lea Verou (W3C CSS WG). Isolar atrás de adapter se possível
- **`src/theme/palette/`** — não é mais uma função `buildTonalPalette`. Hoje é uma classe abstrata `Palette` com subclasses `CustomPalette` (mapa de tons a partir de uma seed) e `TonalPalette<T>` — a derivação de tom é reativa de verdade (`seed: TSignal<T>` + cache de tons como `derived` da seed — ler `palette.get(tom)` dentro de um derived registra a dependência), não um rebuild imperativo. `TONE_STOPS` em `declarations.ts`; `PALETTES` (instâncias prontas) em `presets.ts` — separados em 2026-09-24 porque `declarations.ts` importava `model.ts` e vice-versa (import circular que quebrava quando `model.ts` carregava primeiro)
- **`src/theme/style/`** — `ThemeStyle<N,S,C>` (nome + `slotColors: Record<string, Palette>` + `components`) e o tipo `SlotColor = {id, value: TReadable<Color>}`. Isso já parece o começo de uma camada de papel semântico (slot → cor reativa) — verificar o uso real antes de assumir escopo ou nomenclatura, não é o vocabulário Material 3 antigo que foi removido de propósito
- **`themeManager`** (`html/managers/theme/` — light/dark detect + persist + live system-preference tracking) **não existe mais** — removido junto com `html/`. `Theme` hoje (`src/theme/model.ts`) é só `{ mode: TSignal<TThemeMode>, style: TSignal<ThemeStyle> }`, sem detecção de SO/persistência embutida
- **`VariantCell` para style/theme como dois eixos independentes não existe mais** — ver nota em "Módulos reativos"

---

## Dependências

### Runtime
- `colorjs.io` — ver seção de temas

### DevDependencies — confiança alta (Microsoft/Vercel/comunidade)
`typescript`, `vite`, `vitest`, `prettier`, `turbo`, `@types/node`, `@microsoft/api-extractor`

### DevDependencies — avaliar/remover com o tempo
- `concurrently` — substituível por script próprio
- `chokidar` — avaliar `fs.watch` nativo (Node 22+)
- `tsx` — Node 22.6+ tem `--experimental-strip-types`
- `vite-plugin-dts` — avaliar substituição por `tsc` direto

---

## Plano de evolução

```
Auditoria dos módulos existentes (unicode, surrogate pairs)
        ↓
Refatoração do Parser (estrutura + reatividade via signal/derived)
        ↓
Lexer genérico (em cima do Parser)
        ↓
AST genérico mínimo
   ├── Interno: documentação, versionamento, geração de index.ts
   └── Exportado: parsers, DSLs, validadores customizados
        ↓
Publicação
        ↓
Possível reescrita de módulos de baixo nível em Rust/WASM
(distribuição multi-linguagem via runtime WASM)
```

**Por que Lexer/AST é bloqueante:** o compiler API do TypeScript é ~500ms para projetos pequenos, aloca objetos demais e tem API difícil. O AST próprio resolve geração de documentação, versionamento semântico por diff real e geração do `index.ts` de forma mais rápida e controlada.

**Atualização 2026-08:** a geração do `index.ts` **migrou para o AST próprio** (`scripts/doc/index-gen.ts` sobre `extract.ts`) e todo o código que dependia do compiler API foi **removido** — `scripts/analyzer/`, `scripts/tools/` inteiro (incl. o versionamento semântico por diff de API que chegou a existir sobre o `AnalyzerProject`) e o workflow `pr-analysis.yml`. `docs/EXTRACTED.md` (via `pnpm docs:ast`) é a única geração de doc hoje. Versionamento voltou a ser manual. `Parser` refatorado / AST mais completo continuam não implementados.

---

## Critérios de qualidade

- **200+ linhas** → arquivo fazendo coisas demais, separar por responsabilidade
- **ms onde deveria ser µs** → abstração custando mais do que deveria, perfilar
- **API verbosa, limitada ou que exige conhecimento interno** → errado
- Os três puxam em direções opostas — equilíbrio é a meta

### Legibilidade para quem não acompanhou o código

O autor lê código de baixo nível devagar, não "de bater o olho" — otimizar para isso, não para
densidade. Duas regras concretas que caíram bem na reescrita do `aho-corasick` (2026-09-01):

- **Preferir várias funções pequenas de responsabilidade única a poucas funções grandes.** Uma
  função longa com 3 fases misturadas é mais difícil de acompanhar que 3 funções nomeadas
  chamadas em sequência, mesmo que o total de linhas cresça um pouco. Ex.: `compile()` virou
  `buildTrie` → `linkFailures` → `flatten`, cada uma isolada.
- **Sem número mágico solto.** Um literal no meio do código sem estar amarrado a um nome (ou, na
  falta disso, um comentário) que explique sua existência é confuso para quem não veio das
  versões anteriores — pode levar muito tempo pra entender por que aquele valor está ali.
  Extrair para constante nomeada. Ex.: o `128` do range ASCII virou `ASCII_ALPHABET_SIZE`.
- **Constantes e coisas estáticas vão preferencialmente em `declarations.ts`** do módulo — é a
  convenção do autor com arquivos desse nome. Marcar `@internal` se for detalhe de implementação
  que não deve vazar pro `src/index.ts` gerado.

---

## Decisões técnicas — o que NÃO fazer

- **Não usar `str[i]` sem verificar surrogate pairs** em código que lida com texto de usuário
- **Não usar `split("")` ou `[...str]`** onde performance importa
- **Não chamar sibling static methods via `this`** — sempre usar `ClassName.method()`
- **Não usar `\p{...}` sem flag `u`/`v`** — silenciosamente não funciona
- **Não usar o compiler API do TypeScript** para análise de código nos scripts — agora é regra limpa: `scripts/analyzer/` e todo `scripts/tools/` que dependiam de `ts.Program` foram removidos (2026-08). O que sobrou (`scripts/doc/`) roda sobre `src/language` (`TypescriptLang`). Não reintroduzir `import ts from "typescript"` em script novo — se o AST próprio não dá conta, é sinal pra estender o AST, não pra voltar ao compiler API
- **Não copiar strings desnecessariamente** — padrão flyweight: guardar índices, extrair lazy
- **Não adicionar dependências de runtime** sem justificativa clara
- **Não escrever em signal dentro do `compute` de um derived** — lança erro de propósito (lazy = o efeito dependeria de quando alguém lê; o derived se dá por atualizado com valor inconsistente; listeners rodariam no meio do cálculo). Efeito colateral vai em `subscribe`
- **Não ressuscitar especulativamente** código removido intencionalmente (`isEmptyObj`, `ValidationPlugin`, etc.) — só se surgir necessidade concreta. E mesmo com necessidade concreta: checar primeiro se foi remoção definitiva ou "vai ser refeito diferente" (ver "⚠️ Este arquivo pode estar desatualizado" no topo) — trazer de volta na forma antiga quando o autor já queria uma forma nova é tão errado quanto ressuscitar sem necessidade nenhuma
- **Não adicionar JSDoc proativamente** sem uma estratégia definida
- **Não manter estado eager em field initializer/constructor** em managers que rodam sob Node em testes — manter lazy no primeiro acesso (`matchMedia`, `localStorage`, `document`)
- **Não fundir `Parser` e `Lexer` num autômato/scan único perseguindo performance** — testado de verdade (branch `clean-code`, 2026-08-26): um protótipo `Scanner` com um `AhoCorasick` só (padrões de gate + padrões de token juntos, 1 scan sobre o texto inteiro) saiu no empate com a composição atual `Lexer` (que usa `Parser` internamente + um segundo `AhoCorasick` só sobre os gaps) — e até um pouco pior no texto grande (500K chars: 34.4ms fundido vs 33.7ms composto). Razão: a composição atual já pula o interior de string/comentário inteiro na passada de literais (`Parser` devolve isso como gap excluído); o autômato fundido precisa transicionar por *todo* char do texto, inclusive dentro de delimitadores (só descarta o match ali, não evita o lookup na tabela `goto`). Ou seja, "1 passada com autômato maior" perde exatamente o que "2 passadas com autômatos menores, uma pulando region conhecida" ganha. Resultado idêntico byte-a-byte confirmado antes de descartar (não foi só benchmark, foi corretude + benchmark). Não tentar de novo sem um motivo novo que mude essa equação (ex: gaps ficarem raros/pequenos no uso real).

---

## Bugs notáveis corrigidos — histórico

| Data | Bug | Impacto |
|---|---|---|
| 2026-07-17 | `this.sibling()` em static methods | Quebrava API pública ao extrair métodos como referência |
| 2026-07-17 | `debounce()` usava `Timeout.refresh()` (Node-only) | Quebrava no browser |
| 2026-07-17 | `step()` off-by-one | Disparava com `amount+1` calls em vez de `amount` |
| 2026-07-18 | Cache de nested proxy desatualizado | Proxy wrappava objeto errado após reassignment |
| 2026-07-19 | `writeFile` incondicional = loop de rebuild infinito | Build travava em watch mode |
| 2026-07-19 | chokidar v4 sem suporte a globs | Novos arquivos não eram detectados |
| 2026-07-21 | Traversal do analyzer descendo em corpos de função | ~170 entradas espúrias em docs |
| 2026-08-11 | `\p{...}` sem flag `u` | Predicados de caractere sempre retornavam errado |
| 2026-08-23 | `dist/index.d.ts` nunca bundled | Tipos degradavam para `any` em consumidores |
| 2026-08-23 | `process.cwd()` em module scope em `ts-ast/model.ts` | Crash em qualquer browser (ReferenceError) |
| 2026-08-25 | `_String.capitalize` usava `charAt(0)`/`toUpperCase()` direto | Quebrava quando o primeiro char era um surrogate pair (astral) — corrigido para `codePointAt`/`String.fromCodePoint` |
| 2026-08-25 | `_String.charCodeArray` retornava `.toString(16)` (hex) | Nome do método promete code unit numérico; consumidor que esperava número quebrava. Corrigido para retornar o `charCodeAt` puro |
| 2026-09-24 | `TonalPalette.get` só limpava o cache ao pedir um tom novo | Depois de trocar a `seed`, tons já pedidos voltavam com a cor antiga — cache virou `derived` da seed |
| 2026-09-24 | `Time.calendarDays`: `for (i < 42 - calendarDays.length)` reavaliado enquanto o array crescia | Grade do calendário com menos de 42 células — virou `CALENDAR_CELLS` calculado uma vez |
| 2026-09-24 | `Time.getTime`/`toString`/... eram `bind` na data inicial | Com `new Time(data)`, devolviam a data padrão (agora) em vez da passada — viraram métodos que leem a data atual |
| 2026-09-24 | `import { read } from "fs"` sem uso em `theme/palette/model.ts` | Módulo Node-only numa lib que roda em browser — removido |
| 2026-09-14 | Regra de `G` (`src/language/grammar.ts`) escrita como `choice(node(seq(field(x, NIVEL_BAIXO), resto...)), NIVEL_BAIXO)` | `NIVEL_BAIXO` é computado 2x quando o padrão composto falha (1x tentando, 1x de novo no fallback) — sem problema isolado, mas se `NIVEL_BAIXO` for alcançável recursivamente através de si mesmo (típico em cadeia de precedência de expressão/tipo — parêntese, argumento de chamada, generic), a duplicação composta multiplicativamente a cada nível de aninhamento. Achado construindo `TypescriptLang`: `ConditionalExpr`/`AssignmentExpr`/`ConditionalType`/`ExponentExpr`/`UnaryExpr` tinham esse padrão: parsing de arquivo de ~250 linhas foi de timeout/OOM pra <50ms depois de reescrever essas 5 regras pra computar o nível-base 1x (`const x = NIVEL_BAIXO(ctx,pos); if (!x.ok) return x; ...`) e ramificar manualmente em vez de usar `choice`. Regra geral pra qualquer regra nova nesse estilo: nunca `choice(um-padrão-que-já-consome-X, X)` — sempre computar `X` uma vez só e ramificar a partir do resultado. |

---

## Mantendo este arquivo

Atualizar em pequenas edições conforme as coisas surgem — não reescrever em bloco. Quando algo parecer incomum, inconsistente, ou duas coisas disagreeing sem razão clara: registrar aqui (ou perguntar ao autor primeiro se for decisão viva). O objetivo é que sessões futuras não precisem redescobrir o que já foi resolvido.

**No começo de uma conversa nova, depois de um período sem trabalhar no projeto:** não assumir que a "Estrutura de módulos", a presença de testes/docs, ou uma seção "X foi removido" ainda reflete o código — o autor reescreve em escala periodicamente e esse arquivo só é atualizado quando alguém lembra de pedir. Uma checagem rápida (`ls src/`, grep pelo símbolo em questão) antes de agir sobre uma afirmação estrutural evita propagar informação stale — ver "⚠️ Este arquivo pode estar desatualizado" no topo.