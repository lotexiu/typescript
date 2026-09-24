# Signals — como funciona por dentro

Este documento explica o núcleo reativo da lib (`src/signal/`): o que ele faz, **como** faz e **por que** foi feito assim. A ideia é dar para entender o funcionamento, não só usar. Todos os exemplos foram executados; a saída mostrada nos comentários é a saída real.

**Mapa dos arquivos**

| Arquivo | O que tem |
|---|---|
| `model.ts` | A API pública: `signal()`, `derived()`, `Signal.batch`, `Signal.untracked`, `instanceof`. É uma "fachada" fina. |
| `node.ts` | `ReactiveNode` (interno): o grafo, o rastreamento de dependências, a propagação. Toda a lógica está aqui. |
| `types.ts` | `TSignal<T>`, `TDerived<T>`, `TReadable<T>`, `TEqual<T>`. |
| `declarations.ts` | `NODE_FLAGS` (os bits de estado do nó) e as mensagens de erro (`SIGNAL_LOCALES`). |

Os listeners (`subscribe`) usam `ListenerUtils`, em `src/subscription/utils.ts`.

---

## Sumário

1. [Uso em 2 minutos](#1-uso-em-2-minutos)
2. [O modelo mental: um grafo](#2-o-modelo-mental-um-grafo)
3. [Como as dependências são descobertas](#3-como-as-dependências-são-descobertas)
4. [Escrita: o "push"](#4-escrita-o-push)
5. [Leitura: o "pull"](#5-leitura-o-pull)
6. [Versões e o corte por igualdade](#6-versões-e-o-corte-por-igualdade)
7. [Época: o atalho da leitura](#7-época-o-atalho-da-leitura)
8. [Nós vivos e nós dormentes](#8-nós-vivos-e-nós-dormentes)
9. [Dependências dinâmicas: refazendo a lista a cada cálculo](#9-dependências-dinâmicas-refazendo-a-lista-a-cada-cálculo)
10. [Listeners: quando e como são chamados](#10-listeners-quando-e-como-são-chamados)
11. [Regras e erros](#11-regras-e-erros)
12. [Mutação no lugar com `notify()`](#12-mutação-no-lugar-com-notify)
13. [Anatomia do `ReactiveNode`](#13-anatomia-do-reactivenode)
14. [Decisões de performance (e o que foi medido)](#14-decisões-de-performance-e-o-que-foi-medido)
15. [Limitações conhecidas](#15-limitações-conhecidas)
16. [Vindo do `Model`/`Computed` antigos](#16-vindo-do-modelcomputed-antigos)
17. [Glossário](#17-glossário)

---

## 1. Uso em 2 minutos

```ts
import { signal, derived, Signal } from '@ts/signal/model';

const preco = signal(10);                         // valor que pode ser escrito
const qtd = signal(2);
const total = derived(() => preco() * qtd());     // valor calculado a partir de outros

total();          // 20   ← ler é CHAMAR a função
preco.set(15);
total();          // 30   ← recalculou sozinho
```

| Signal (`TSignal<T>`) | Derived (`TDerived<T>`) |
|---|---|
| `s()`: lê | `d()`: lê (recalcula se precisar) |
| `s.set(v)`: escreve (retorna `false` se igual) | — (não se escreve num derived) |
| `s.update(v => ...)`: escreve a partir do atual | — |
| `s.notify()`: avisa após mutar o objeto no lugar | — |
| `s.subscribe(fn)`: `fn(valor)` a cada escrita | `d.subscribe(fn)`: `fn(valor)` só quando o valor **muda** |
| `s.dispose()` | `d.dispose()` |

Utilitários: `Signal.batch(fn)`, `Signal.untracked(fn)`, `x instanceof Signal`, `x instanceof Derived`. Os dois construtores aceitam um segundo argumento `equal(a, b)` para definir o que conta como "mudou" (o padrão é `Object.is`).

---

## 2. O modelo mental: um grafo

Cada `signal` e cada `derived` tem por trás um **nó** (`ReactiveNode`). Quando um derived lê outro valor, nasce uma **aresta** entre os dois:

```
 signal preco ──┐
                ├──► derived total ──► derived comTaxa ──► listener (subscribe)
 signal qtd ────┘
```

Dois papéis:

- **Produtor**: quem é lido (`preco`, `qtd`, `total`).
- **Consumidor**: quem lê (`total`, `comTaxa`).

Um derived é as duas coisas ao mesmo tempo: consome `preco`/`qtd` e produz para `comTaxa`. Um signal é só produtor.

### Derived é preguiçoso

Um derived **só calcula quando alguém lê**. Escrever nas dependências não dispara o cálculo:

```ts
const a = signal(1);
let runs = 0;
const d = derived(() => { runs++; return a() * 2; });

runs;          // 0 — nunca foi lido, nunca calculou
a.set(2);
a.set(3);
runs;          // 0 — as escritas não fizeram ele calcular
d();           // 6, runs: 1 — calculou agora, uma vez só (com o valor final)
d();           // 6, runs: 1 — nada mudou, devolveu o guardado
```

Isso é o que faz o sistema ser barato: um derived que ninguém lê custa zero.

---

## 3. Como as dependências são descobertas

Você nunca diz a um derived do que ele depende. Ele descobre **durante a própria execução**, e o mecanismo inteiro é uma variável global: `activeConsumer`.

```ts
// node.ts
let activeConsumer: ReactiveNode<any> | null = null;
```

Ela responde a uma pergunta: **"tem algum derived calculando neste exato momento?"**

Passo a passo de `total()` na primeira vez:

```
1. total() → total.read() → total.#refresh() → "nunca calculei" → total.#recompute()
2. #recompute guarda o activeConsumer anterior (null) e faz:  activeConsumer = total
3. roda o compute do usuário: preco() * qtd()
     preco() → preco.read() → activeConsumer é `total`? sim → #track(preco)
                              → cria o link  preco ──► total
     qtd()   → qtd.read()   → activeConsumer é `total`? sim → #track(qtd)
                              → cria o link  qtd ──► total
4. o compute termina → activeConsumer volta a ser null (o valor guardado no passo 2)
```

Uma leitura **fora** de um derived (no seu código comum) encontra `activeConsumer === null` e não registra nada.

### Derived dentro de derived

`#recompute` guarda o consumidor anterior e o restaura no fim. Na prática isso funciona como uma pilha:

```
comTaxa() começa        activeConsumer = comTaxa
  lê total()            → link  total ──► comTaxa
    total recalcula     activeConsumer = total
      lê preco()        → link  preco ──► total      (conta para `total`, não para `comTaxa`)
    total termina       activeConsumer = comTaxa     (restaurado)
  lê taxa()             → link  taxa ──► comTaxa     (volta a contar para `comTaxa`)
comTaxa termina         activeConsumer = null
```

Se `total` terminasse zerando o `activeConsumer` em vez de restaurá-lo, a leitura de `taxa()` se perderia.

---

## 4. Escrita: o "push"

`preco.set(15)` faz três coisas (`#changed` em `node.ts`):

```
1. preco.#version++    e    epoch++          → "algo mudou" fica registrado
2. #propagate(preco)                         → marca DIRTY nos consumidores VIVOS, em cascata
3. #flush()                                  → chama os listeners
```

O ponto importante está no passo 2: **a escrita não recalcula nada**. Ela só percorre os consumidores vivos (veja a [seção 8](#8-nós-vivos-e-nós-dormentes)) e liga um bit `DIRTY` em cada um, que quer dizer "talvez você tenha mudado". O recálculo fica para quem ler.

### Por que um diamante é barato

```
        ┌──► b ──┐
   a ───┤        ├──► d
        └──► c ──┘
```

Numa escrita em `a`, a propagação visita `b` e marca `d`. Depois visita `c` e chega em `d` de novo, mas `d` já está `DIRTY`, então **não desce outra vez**. Tudo abaixo de `d` já foi marcado na primeira passagem. Cada nó é marcado no máximo uma vez por escrita.

### Por que é iterativo

`#propagate` usa uma pilha manual (`propagateStack`) em vez de recursão. Assim uma cadeia de 100 mil derived vivos não estoura a pilha do JavaScript. A pilha é reaproveitada entre escritas, então não aloca memória a cada `set`.

---

## 5. Leitura: o "pull"

Quando você lê `total()` e ele pode estar desatualizado, `#refresh` decide se precisa recalcular. As perguntas vão **da mais barata para a mais cara**:

```
#refresh():
  a) conferido nesta época?            sim → pronto (nada foi escrito desde então)
  b) estou no meio do meu cálculo?     sim → erro de ciclo
  c) vivo e não DIRTY?                 sim → pronto (se algo mudasse, o push teria marcado)
  d) nunca calculei / último deu erro? sim → recalcula
  e) alguma dependência mudou?         sim → recalcula      ← #producersChanged, o passo caro
  (fim) anota "conferido nesta época" e desliga DIRTY
```

### "Alguma dependência mudou?" (`#producersChanged`)

O derived percorre suas dependências **na ordem em que as leu** e, para cada uma, compara a versão que viu da última vez (`link.lastReadVersion`) com a versão atual (`producer.#version`):

```
para cada dependência:
  versões diferentes?                  → mudou, recalcula (para aqui)
  é um derived? → manda ELE se conferir (#refresh dele)   ← o pull descendo
  agora as versões são diferentes?     → mudou, recalcula
nenhuma mudou                          → não recalcula
```

O segundo passo é o coração do "pull". A versão de um derived só sobe quando **ele** é conferido. Por isso, antes de confiar na versão de uma dependência derived, é preciso pedir que ela mesma se atualize, e isso desce recursivamente até as fontes.

---

## 6. Versões e o corte por igualdade

Cada nó tem `#version`, um número que **só sobe quando o valor muda de fato**. Se um derived recalcula e o resultado é igual ao anterior (segundo `equal`), a versão **não sobe**.

Consequência: quem depende dele compara versões, vê que são iguais e **não recalcula**. A mudança para de se espalhar ali. Isso é o **corte por igualdade**.

```ts
const n = signal(2);
const par = derived(() => n() % 2 === 0);          // boolean
const texto = derived(() => par() ? 'par' : 'ímpar');

texto();
n.set(4);        // 2 → 4
texto();         // 'par'   — `par` rodou (deu true de novo), `texto` NÃO rodou
n.set(5);        // 4 → 5
texto();         // 'ímpar' — `par` rodou (virou false), `texto` rodou
```

Saída real do contador: depois de `n.set(4)`, `par` rodou 2 vezes e `texto` só 1. `par` recalculou e deu `true` de novo, a versão ficou igual, e `texto` nem foi chamado.

O mesmo vale para os listeners: `derived.subscribe(fn)` só chama `fn` quando o valor muda de verdade.

```ts
const n = signal(2);
const par = derived(() => n() % 2 === 0);
par.subscribe(v => console.log('par mudou para', v));
n.set(4);   // (nada)
n.set(6);   // (nada)
n.set(7);   // "par mudou para false"
```

---

## 7. Época: o atalho da leitura

`epoch` é um contador **global** que sobe a cada escrita em qualquer signal. Cada nó anota em `#lastCleanEpoch` em que época foi conferido pela última vez.

```ts
read(): T {
  if (this.#compute !== undefined && this.#lastCleanEpoch !== epoch) this.#refresh();
  ...
}
```

Se `lastCleanEpoch === epoch`, **nenhuma escrita aconteceu em lugar nenhum** desde a última conferência. O valor guardado está certo e a leitura nem entra no `#refresh`. É o caso mais comum (ler várias vezes sem escrever entre as leituras), e custa duas comparações.

Por isso as duas checagens mais comuns estão escritas dentro do próprio `read()`: a leitura típica não chama nenhuma outra função.

---

## 8. Nós vivos e nós dormentes

Um nó é **vivo** quando alguém está ouvindo: um listener (`subscribe`) ou outro nó vivo que depende dele.

```ts
#isLive() { return this.#consumers !== undefined || this.#listeners !== undefined; }
```

Só nós vivos recebem o push (`DIRTY`). Os outros são **dormentes** e se conferem sozinhos quando lidos (o pull, com as versões).

### Por que nem todo nó é vivo? Memória.

Para receber push, o consumidor precisa estar registrado **na lista do produtor** (`producer.#consumers`). Se todo derived fizesse isso, um signal de vida longa (o tema da aplicação, por exemplo) manteria na memória **todo derived que já o leu**, inclusive os que ninguém usa mais. O garbage collector nunca conseguiria coletá-los.

Um derived dormente conhece suas dependências (lista `#producers`), mas **as dependências não o conhecem**. Quando ninguém mais referencia o derived, ele é coletado normalmente.

### Ficar vivo se espalha para cima

```ts
const a = signal(1);
const soma = derived(() => a() + 1);
const dobro = derived(() => soma() * 2);

dobro.subscribe(v => ...);
```

Quando `dobro` ganha um listener, ele fica vivo. Mas se `soma` continuasse dormente, a escrita em `a` não chegaria até `dobro`, porque `a` não saberia que `soma` existe. Então ficar vivo **se propaga para cima**: `dobro` se registra em `soma` (`#goLive`), `soma` passa a ter um consumidor vivo e também se registra em `a`.

O caminho inverso também existe. Quando o último listener sai (`unsubscribe`), `dobro` **adormece** (`#goDormant`) e sai da lista de `soma`. `soma` fica sem consumidores, adormece também e sai da lista de `a`.

```
subscribe:     dobro vivo → soma vivo → registrado em a
unsubscribe:   dobro dormente → soma dormente → removido de a
```

### Por que um nó vivo pode pular a conferência

Um nó vivo e **não** `DIRTY` tem uma garantia: se qualquer dependência tivesse mudado, o push o teria marcado. Então, na pergunta (c) do `#refresh`, ele pode dizer "estou atualizado" sem olhar as versões. Um nó dormente não tem essa garantia, porque ninguém avisa ele de nada, e precisa sempre conferir.

---

## 9. Dependências dinâmicas: refazendo a lista a cada cálculo

As dependências de um derived podem mudar de uma execução para outra:

```ts
const usarA = signal(true);
const a = signal('A'), b = signal('B');
const x = derived(() => usarA() ? a() : b());

x();              // 'A'  — dependências: usarA, a
b.set('B2');
x();              // 'A'  — não recalculou: b não é dependência (ainda)
usarA.set(false);
x();              // 'B2' — dependências agora: usarA, b
a.set('A2');
x();              // 'B2' — não recalculou: a deixou de ser dependência
```

### Como a lista é refeita sem jogar tudo fora

Na maioria das vezes um derived lê **as mesmas coisas na mesma ordem**. Então, em vez de apagar a lista e criar links novos a cada cálculo, `#track` **caminha sobre a lista antiga** com um ponteiro (`#producersTail`) e pergunta: "a próxima leitura é o mesmo produtor que estava aqui da última vez?"

```
execução 1 leu: usarA, a        lista: [usarA] → [a]

execução 2 leu: usarA, b
  lê usarA → o próximo da lista antiga é [usarA]? sim → REAPROVEITA, tail = [usarA]
  lê b     → o próximo é [a], não é b             → cria [b] ANTES de [a], tail = [b]
                                  lista: [usarA] → [b] → [a]
  fim: tudo depois do tail ([a]) não foi lido → #dropUnreadProducers remove
                                  lista: [usarA] → [b]
```

No caso comum (mesmas leituras, mesma ordem), **nenhum link é criado nem destruído**: o tail só avança e atualiza a versão lida.

### Leitura repetida não duplica

```ts
derived(() => a() + b() + a())
```

Sem cuidado, isso criaria 3 links (`a`, `b`, `a`). Para evitar, cada execução de `compute` recebe um número único (`#runId`, vindo do contador global `runCounter`), e o produtor anota o número da última execução que o registrou (`#trackedInRun`). Se o produtor já tem o número desta execução, a leitura é ignorada: ele já foi registrado. Isso economiza cerca de 73 bytes por leitura repetida (memória medida: 754 → 490 bytes num derived com 5 leituras de 2 signals).

---

## 10. Listeners: quando e como são chamados

```ts
const off = s.subscribe(valor => { ... });   // devolve a função de cancelar
off();                                        // cancelar duas vezes é seguro
```

### Quando rodam

**Depois** que a propagação inteira termina, nunca no meio dela. Durante `#propagate`, quem tem listener só entra numa fila (`pending`, com o bit `QUEUED` para não entrar duas vezes). No fim, `#flush` esvazia a fila.

Isso garante que um listener nunca vê o grafo "meio marcado", com parte dos nós ainda sem saber da mudança.

### Signal × derived

- **Signal**: o listener é chamado a cada escrita que passou no `equal`.
- **Derived**: o nó recalcula na hora do flush e compara a versão com `#emittedVersion` (a última que os listeners viram). Só chama se mudou.

Consequência importante: **um derived com listener deixa de ser preguiçoso**. Ele precisa recalcular a cada mudança das dependências para saber se mudou.

### `batch`

```ts
const a = signal(1), b = signal(1);
const soma = derived(() => a() + b());
soma.subscribe(v => console.log('soma =', v));

a.set(2);                                   // "soma = 3"
b.set(2);                                   // "soma = 4"
Signal.batch(() => { a.set(10); b.set(20); });   // "soma = 30"  ← uma vez só
```

Dentro do `batch`, as marcações `DIRTY` continuam acontecendo na hora, então uma leitura dentro do lote vê os valores atualizados. Só a chamada dos listeners espera o **lote mais externo** terminar.

### Listener que escreve

Pode. A escrita dentro de um listener só aumenta a fila, e o laço do flush em andamento pega os itens novos:

```ts
const c = signal(0), f = signal(32);
c.subscribe(v => f.set(v * 9 / 5 + 32));
f.subscribe(v => console.log('f =', v));
c.set(100);                                  // "f = 212"
```

### Erros em listeners

Um listener que lança erro **não impede os outros** de rodar. Os erros são juntados e lançados no fim do flush: um erro vai como está, vários vão num `AggregateError`.

### Cancelar durante a notificação

Os listeners ficam num array que é **substituído**, e não alterado, quando alguém se inscreve ou cancela (copy-on-write). Se o listener A cancela o listener B durante uma notificação, B **ainda é chamado nessa rodada**, porque ela já estava percorrendo o array antigo. Nas próximas, não:

```ts
const s = signal(0);
let offB = () => {};
s.subscribe(() => { console.log('A'); offB(); });
offB = s.subscribe(() => console.log('B'));
s.set(1);   // A, B
s.set(2);   // A
```

É o mesmo comportamento do `EventEmitter` do Node.

---

## 11. Regras e erros

### Não escreva num signal dentro de um derived

```ts
const d = derived(() => { b.set(a()); return 1; });
d();   // Erro: "Escrever num signal durante o cálculo de um derived não é permitido…"
```

**Por quê?** O derived deve **calcular a partir do que lê**, sem efeito colateral. Uma escrita lá dentro causa três problemas:

1. **O efeito depende de quando alguém lê.** Como o derived é preguiçoso, se ninguém o lê, a escrita nunca acontece. Se ele é lido depois de várias mudanças, só o último valor é escrito.
2. **O próprio derived fica inconsistente.** Um derived que lê `a` e escreve em `a` termina com um valor calculado a partir de um `a` que já não existe, e mesmo assim se considera atualizado.
3. **Listeners rodariam no meio de um cálculo**, vendo o grafo pela metade.

Efeitos colaterais vão num `subscribe`. O escape existe (`Signal.untracked(() => b.set(x))`), porque `untracked` zera o `activeConsumer`, mas é responsabilidade de quem usa.

### Ciclo

```ts
const a = derived(() => a() + 1);
a();   // Erro: "Ciclo detectado: um derived leu a si mesmo durante o cálculo."
```

Enquanto o `compute` roda, o bit `COMPUTING` fica ligado. Se o nó for lido de novo nesse estado, é ciclo.

### Erro dentro do `compute`

O erro é repassado para quem leu. O nó liga `MUST_RECOMPUTE`, para que a próxima leitura **tente de novo** em vez de devolver o valor antigo como se fosse válido:

```ts
const n = signal(1);
const raiz = derived(() => { if (n() < 0) throw new Error('negativo'); return Math.sqrt(n()); });
raiz();        // 1
n.set(-1);
raiz();        // lança 'negativo'
raiz();        // lança 'negativo' de novo (não devolve o 1 antigo)
n.set(9);
raiz();        // 3 — recuperou
```

Sem o `MUST_RECOMPUTE`, a segunda leitura veria que as dependências não mudaram desde a primeira e devolveria `1`, um valor que não corresponde a `n = -1`.

### Ler sem criar dependência: `untracked`

```ts
const a = signal(1), b = signal(100);
const d = derived(() => a() + Signal.untracked(b));   // signals são funções: dá para passar direto
d();          // 101
b.set(200);
d();          // 101 — b não é dependência, não recalculou
a.set(2);
d();          // 202 — recalculou por causa de a, e aí leu o b atual
```

### `equal` customizado

```ts
const pos = signal({ x: 0, y: 0 }, (a, b) => a.x === b.x && a.y === b.y);
pos.set({ x: 0, y: 0 });   // false — "igual", não notifica
pos.set({ x: 1, y: 0 });   // true  — notifica
```

---

## 12. Mutação no lugar com `notify()`

Esta lib **não obriga** a trocar o objeto inteiro a cada mudança (o estilo imutável de React e Angular). Dá para mutar o objeto que o signal guarda e avisar:

```ts
const itens = signal<string[]>([]);
const qtd = derived(() => itens().length);
qtd.subscribe(v => console.log('qtd =', v));

itens().push('a');
itens.notify();            // "qtd = 1"

itens.set(itens());        // false — é o mesmo array, `Object.is` diz "igual"
```

`notify()` pula o `equal` e faz tudo que uma escrita faz: sobe a versão, propaga e chama os listeners. É assim que `KeyboardState`, `MouseState`, `StopWatch` e `ValueHistory` funcionam, sem alocar um `Set` ou array novo a cada tecla ou volta.

---

## 13. Anatomia do `ReactiveNode`

A **mesma classe** serve para signal e derived. A diferença é só `#compute`: `undefined` indica uma fonte (signal).

| Campo | Para quê |
|---|---|
| `#value` | valor atual |
| `#compute` | a função do derived (`undefined` = signal) |
| `#equal` | o que conta como "mudou" (padrão `Object.is`) |
| `#flags` | 5 booleanos num inteiro (tabela abaixo) |
| `#version` | sobe só quando o valor muda de fato |
| `#lastCleanEpoch` | época da última conferência (`-1` = "confira de novo") |
| `#emittedVersion` | versão que os listeners viram por último |
| `#runId` | (como consumidor) número da execução atual do `compute` |
| `#trackedInRun` | (como produtor) `#runId` de quem o registrou por último |
| `#producers` / `#producersTail` | de quem dependo (e até onde a execução atual já leu) |
| `#consumers` / `#consumersTail` | quem depende de mim e está vivo |
| `#listeners` | `subscribe`s: nenhum, uma função ou um array |

### Os bits de `#flags` (`declarations.ts`)

| Bit | Significa |
|---|---|
| `DIRTY` | um nó vivo recebeu push e ainda não conferiu |
| `MUST_RECOMPUTE` | calcule sem conferir as dependências (nunca calculou, ou deu erro) |
| `HAS_VALUE` | já tem um valor válido para o `equal` comparar |
| `COMPUTING` | o `compute` está rodando agora (serve para detectar ciclo) |
| `QUEUED` | já está na fila dos listeners |

Leitura de bits em JS: `flags & DIRTY` testa, `flags |= DIRTY` liga, `flags &= ~DIRTY` desliga.

### O `Link`

Cada aresta produtor → consumidor é **um objeto** que fica em **duas listas** ao mesmo tempo:

```
                    soma.#producers
                    ┌──────────────┐   nextProducer   ┌──────────────┐
                    │ link(a→soma) │ ───────────────► │ link(b→soma) │
                    └──────────────┘                  └──────────────┘
                           ▲                                 ▲
   a.#consumers ───────────┘              b.#consumers ──────┘
   (só se soma estiver vivo)              (só se soma estiver vivo)
```

- `producer`, `consumer`: as duas pontas.
- `lastReadVersion`: a versão do produtor quando o consumidor o leu por último.
- `nextProducer`: o próximo na lista do consumidor (simplesmente ligada, na ordem de leitura).
- `prevConsumer`/`nextConsumer`: os vizinhos na lista do produtor (duplamente ligada, para remover em O(1)).

---

## 14. Decisões de performance (e o que foi medido)

Tudo foi medido no Node 24, com cada biblioteca num processo separado. Rodar todas no mesmo processo distorcia os resultados em até ~50%, por causa do JIT.

### Comparação (ms, menor é melhor)

| Cenário | esta lib | Angular | alien-signals |
|---|---|---|---|
| criar 10k signal + derived | 1,27 | 1,63 | **0,63** |
| cadeia de 1000, viva, 200 sets | **~10,0** | 28,3 | 10,4 |
| cadeia de 1000, não viva | **~7,8** | 34,7 | 11,7 |
| 1 signal → 1000 derived vivos | **11,8** | 65,9 | 19,9 |
| diamante 1 → 1000 → soma | **12,4** | 45,4 | 12,5 |
| corte por igualdade | **10,7** | 28,7 | 13,5 |
| dependências dinâmicas | **6,0** | 26,7 | 7,7 |
| leitura repetida `a()+b()+a()+b()` | **17,8** | 97,4 | 32,0 |
| ler 1M vezes sem mudança | **~6,5** | 30,7 | 9,3 |

### Por que a instância é uma função com propriedades

A fachada (`model.ts`) é `() => node.read()` com `set`, `subscribe` etc. pendurados como propriedades. Alternativas testadas:

| Forma | Criar | Ler |
|---|---|---|
| **closure + propriedades (atual)** | 0,65ms | **1,33ms** |
| classe com `Object.setPrototypeOf` na função | ~10x mais lento | igual |
| `.value` como getter (`defineProperty`) | ~10x mais lento | igual |
| `bind` com métodos herdados | 3x mais lento | 4,7x mais lento |
| `bind` puro, sem métodos (alien-signals) | **2,5x mais rápido** | **2,7x mais lento** |

O alien-signals cria mais rápido porque não tem métodos: a mesma função lê com `s()` e escreve com `s(v)`. O custo é que chamar uma função criada por `bind` é mais lento. Como **ler acontece muito mais do que criar**, a escolha foi pela leitura rápida.

### Outras decisões

- **Todo o estado fica no `ReactiveNode`, nada na função.** Propriedades num objeto-função são ~1,7x mais lentas de escrever do que numa instância comum, e o grafo escreve muito.
- **Uma classe só para signal e derived.** Todos os nós têm o mesmo formato, e o V8 otimiza melhor laços que sempre veem o mesmo formato (acessos "monomórficos").
- **Flags de bits.** Um nó menor é mais barato de criar (−13% em relação a 5 booleanos).
- **Listeners sem `Set`.** A maioria dos nós tem 0 ou 1 listener. Um derived com 1 listener caiu de 674 para 474 bytes.
- **Deduplicação de leitura repetida.** −35% de memória nesse caso, e o cenário com leituras repetidas ficou 19% mais rápido. Custo: uma comparação a mais por leitura rastreada, cerca de 5% numa cadeia não viva.
- **Juntar funções para economizar pilha não ajudou.** Colocar `#recompute` dentro de `#refresh` economiza uma chamada, mas a chamada que sobra fica maior, e o limite de profundidade não mudou. Por isso ficaram separadas: são mais legíveis.

### O `ReadonlyValue` continua uma classe

`ReadonlyValue` (em `src/readonly-value/`) não é reativo: calcula uma vez e guarda. Foi testado como closure e ficou **pior** (168 bytes contra 104, leitura 2x mais lenta), porque uma closure com variável mutável precisa de um objeto de contexto extra.

---

## 15. Limitações conhecidas

- **Profundidade na primeira leitura.** Ler pela primeira vez uma cadeia **não viva** de derived desce um nível da pilha do JS por derived (o cálculo de um chama o do anterior). O limite medido fica na casa de 5500 níveis no Node. Isso vale para qualquer modelo preguiçoso; o Angular tem o mesmo limite. A **propagação** (escrita) é iterativa e não tem esse limite.
- **Métodos dependem de `this`.** `const { set } = s; set(1)` não funciona, como acontece com métodos de classe. Use `s.set(1)`. (`field` usa closures de propósito e pode ser extraído.)
- **Derived com listener recalcula a cada mudança.** Para saber se mudou, precisa calcular (veja a [seção 10](#10-listeners-quando-e-como-são-chamados)).
- **Escrita dentro de `untracked` num derived** é permitida (é o escape), mas dispara os listeners na hora, no meio do cálculo. Use com cuidado.

---

## 16. Vindo do `Model`/`Computed` antigos

Os arquivos antigos estão em `.old/`, na raiz do pacote.

| Antes | Agora |
|---|---|
| `model(v)` / `new Model(v)` | `signal(v)` |
| `computed(fn, [deps])` | `derived(fn)` (dependências automáticas) |
| `x.value` | `x()` |
| `m.notifies(m.value)` | `s.notify()` |
| `m.silentSet(v)` | não existe; use `Signal.batch` para agrupar |
| `Computed.setDependencies(...)` | não existe; ler dentro do `derived` já registra |
| `computed.subscribe(c => ...)`: a cada mudança de dependência, recebe o próprio `Computed` | `derived.subscribe(v => ...)`: só quando o valor muda, recebe o valor |
| `computed.prevValue` | saiu do núcleo (só `Variant` tem `prevValue`) |
| `SubscriptionController` | `Subscription` (emissor, com `notify` público) |
| `readField(src, get, [deps])` | `readField(src, get)` (dependências automáticas) |

---

## 17. Glossário

- **Fonte / signal**: nó com valor escrito de fora (`set`).
- **Derived**: nó com valor calculado a partir de outros.
- **Produtor**: nó que é lido. **Consumidor**: nó que lê.
- **Push**: a escrita marcando `DIRTY` nos consumidores vivos.
- **Pull**: a leitura conferindo as dependências e recalculando se preciso.
- **Vivo**: nó com listener, ou do qual um nó vivo depende. Recebe push.
- **Dormente**: nó sem ninguém ouvindo. Confere sozinho quando lido.
- **Versão**: contador por nó; sobe só quando o valor muda.
- **Época**: contador global; sobe a cada escrita em qualquer lugar.
- **Corte por igualdade**: um derived que recalcula para o mesmo valor não sobe a versão, e a mudança para ali.
- **Consumidor ativo (`activeConsumer`)**: o derived que está calculando agora. Leituras nesse intervalo viram dependências dele.
