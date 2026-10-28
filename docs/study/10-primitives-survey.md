# 10 — Levantamento de primitivos (qualquer domínio): o que falta na lib

> A lib não é só interface. Clonei (raso, só leitura, em pasta isolada) projetos de domínios diferentes e medi **o que importam ou reescrevem à mão**.
> Aplicações: `actual` (finanças), `ghostfolio` (investimentos, Angular+Nest), `boardgame.io`, `colyseus`, `Excalibur` (jogos), `brazilian-utils`.
> Bibliotecas de referência: `es-toolkit`, `radashi`, `cockatiel`, `p-queue/p-limit/p-retry`, `rot.js`, `neverthrow`, `ts-pattern`, `zustand`, `immer`, `ky`.
> **[medido]** = contagem no código clonado/local · **[inferência]** = conclusão minha.

## 1. Cobertura nominal contra `es-toolkit` **[medido]**
34 de 198 nomes (**17%**). Por categoria: array 10/69 · function 3/18 · math 11/16 · object **0/24** · predicate 4/32 · promise 1/7 · string 5/23 · util **0/7** · error 0/2.
Nome, porém, não é prioridade (`isString` é `typeof`). A prioridade vem do **uso real**:

## 2. O que as aplicações realmente usam **[medido]** (arquivos que importam)
| Lib | Arquivos | O que se usa | Primitivo que falta na nossa lib |
|---|---:|---|---|
| date-fns / dayjs / luxon | 113 / 149 / 15 | `format` 69×, `parseISO` 32×, `isBefore/After`, `addDays/subDays`, `differenceInDays`, `startOf/endOfDay`, `eachDayOfInterval`, `isSameDay` | **formatar/ler data por padrão** (`dd/MM/yyyy HH:mm`), `startOf/endOf`, iterar intervalo |
| uuid / nanoid | 55 / 3 | `v4()` | **geração de ids** (`uuid`, ids curtos) |
| big.js | 38 (ghostfolio: 73 arquivos incl. tipos) | `new Big(a).mul(b).div(c)` | **decimal exato** (dinheiro, impostos, arredondamento) |
| lodash-es | 70 | `isNumber/isString/isNil/isEmpty`, `groupBy`, `uniqBy`, `omit/pick`, `mapValues`, `sortBy/orderBy`, `keyBy`, `cloneDeep`, `round` | `keyBy`, `pick/omit`, `mapValues`, `cloneDeep`, `isEqual`, `isEmpty` |
| es-toolkit | 11 | `debounce`, `keyBy`, `isEqual`, `isMatch`, `uniqueId` | (idem) |
| rxjs | 35 | operadores | fora de escopo |

Helpers **escritos à mão** que se repetem entre projetos: `delay/sleep`, `capitalize`, `format*` (CEP/telefone/data/BRL), validadores de documento, `handleError`, `iteratorToStream`.

## 3. O que cada domínio implementou por conta própria **[medido]**
| Domínio | Achados | Primitivo |
|---|---|---|
| **Jogos** | `rot.js`: `RNG` com semente (`setSeed/getState/setState/clone/getUniformInt/getNormal/getWeightedValue/getItem`), `MinHeap`, `EventQueue`, `Scheduler` (simples/velocidade/ação), `Engine`, A*/Dijkstra, FOV, ruído, mapas. `boardgame.io`: `Random` com semente por plugin, ordem de turnos, fases/estágios, log com desfazer. `Excalibur`: `Random`, `Timer`, `Clock`. `colyseus`: relógio/timers atrasados | **PRNG com semente**, **fila de prioridade**, **agendador/relógio injetável**, **máquina de estados/turnos**, **caminho mínimo em grafo/grade** |
| **Finanças** | `actual`: dinheiro como **inteiro em centavos** (`amountToInteger` com `Math.round` — erro de ponto flutuante latente), `looselyParseAmount` (ler valor sem saber o locale), **avaliador de expressão** (`2+3*4` em campo de valor) escrito à mão, **recorrência** (`frequency/interval/endMode/patterns` + "se cair no fim de semana, antes/depois"), `months.ts` | **Decimal**, **ler número de texto livre**, **calculadora de expressão segura**, **regra de recorrência** |
| **Resiliência/infra** | `cockatiel`: `RetryPolicy` + backoffs (constante, exponencial, **jitter decorrelacionado**, iterável), `CircuitBreaker` (consecutivo/contagem/amostragem), `TimeoutPolicy`, `Bulkhead`, `Fallback`. `p-queue/p-limit`: concorrência. `actual` e Grimoire: `retry`, `mutex`, `rateLimiter` próprios | **Mutex/Semáforo/fila com concorrência**, **retry com backoff+jitter+cancelamento**, **timeout/abort**, **disjuntor** |
| **Tipos/erros** | `neverthrow`, `radashi` (`tryit`, `toResult`, `isResult`), `es-toolkit` (`attempt`, `attemptAsync`, `invariant`) | **`Result`** (erro como valor) — nós já usamos `{ ok, reason }` em 3 lugares, cada um à mão |
| **Estado** | `zustand`, `immer`, `nanostores` | já coberto por `signal`/`computed` |

## 4. Lacunas priorizadas
**A — evidência forte, pequeno, agnóstico, portável (fazer já):**
1. `Decimal` (BigInt, sem dependências; modos de arredondamento) — big.js em 73 arquivos; "fiscal" depende disso.
2. `Random` com semente (xoshiro128\*\*, estado serializável) + ids (`uuid v4`, id curto) — 3 de 3 projetos de jogo reescrevem; `uuid` em 55 arquivos.
3. `Result` — unifica o erro-como-valor da lib.
4. `Mutex`, `Semaphore`, limitador de concorrência, `withTimeout`/`AbortError` — es-toolkit/p-limit/Grimoire.
5. `PriorityQueue` (heap) — base de agendador, Dijkstra, timers.
**B — forte, maior:** formatação/leitura de data **por padrão** com provider de nomes; `startOf/endOf`/iterar intervalo em `PlainDate`; `retry` com backoff/jitter/cancelamento; calculadora de expressão (→ `Decimal`); recorrência; ler número de texto livre; relógio injetável.
**C — por domínio:** máquina de estados/turnos, agendador, A*/grade, ruído, disjuntor/bulkhead.
**D — baixo valor por nome:** predicados triviais (`isString`…), `camelCase` e afins (ficam em `StringUtils` quando precisarem).
Coleções (`keyBy`, `pick/omit`, `mapValues`, `cloneDeep`, `isEqual`, `countBy`, `difference/intersection/union`, `compact`, `minBy/maxBy/sumBy`) entram junto da A, em `ArrayUtils`/funções de objeto.

## 5. Estado (2026-10-28)
Feito do grupo **A**: `Decimal`, `Random`, `IdUtils`, `ResultUtils`, `Semaphore`/`Mutex`/`AsyncUtils.timeout`, `PriorityQueue` (vetores do Decimal e do Random conferidos contra Python).
Próximo (B): formatar/ler data por padrão, `startOf/endOf`/intervalo em `PlainDate`, `retry` com backoff+jitter+cancelamento, calculadora de expressão, recorrência, mutex entre threads (`SharedArrayBuffer` + `Atomics`).

## 6. Classe × função × composto (critério)
1. **Tem estado que muda, ou invariante a proteger?** → **classe** em `model.ts` (primitivo). Ex.: `Random` (4 palavras), `Semaphore` (fila), `PriorityQueue`, `MaskEngine` (regras + cache), valores imutáveis com invariante (`Decimal`, `PlainDate`: data inválida não existe). **Especialização de uma classe também é classe**: `Mutex extends Semaphore` herda `acquire/run/available/pending` sem repassar nada; composição só criaria delegação à toa.
2. **Só transforma entrada em saída?** → **função**, `static` em `XUtils`. Ex.: `ChecksumUtils`, `IdUtils`, `ResultUtils`, `CalendarUtils`, `RegexUtils`, `MaskCheckUtils`.
3. **Junta várias classes/funções/utils num objeto fácil de usar?** → **composto**: fábrica que devolve closures (o formato dos composables: `signal`, `field`, `ticker`, `task`, `selection`). Vantagem prática: `const { next, prev } = activeIndex(...)` funciona, porque nada depende de `this`.
   - Método de classe **perde o `this`** ao ser desestruturado (`const { run } = mutex` → `TypeError`, os campos `#` não existem fora da instância). Quem precisa desse uso deve ser composto, ou a classe deve expor o método já ligado.

Dado puro (`TResult`, `TRandomState`, regra de recorrência) atravessa `postMessage`/JSON inteiro; instância de classe perde os métodos ao ser clonada para um worker. Rust: classe com estado → `struct` + `impl`; util → funções livres; composto → função construtora que devolve um struct de closures/traits.
