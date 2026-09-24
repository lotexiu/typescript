import { LocaleError } from '@ts/locale/error';
import { TListeners, TValueListener, TValueUnsubscribe } from '@ts/subscription/types';
import { ListenerUtils } from '@ts/subscription/utils';
import { NODE_FLAGS, SIGNAL_LOCALES } from './declarations';
import { TEqual } from './types';

// ═════════════════════════════════════════════════════════════════════════════════════════════
// VISÃO GERAL (explicação longa, com exemplos: `./README.md`)
//
// Todo `signal` e todo `derived` tem um `ReactiveNode` por trás. Os nós formam um grafo:
//
//     signal a ──┐
//                ├──► derived soma ──► derived dobro ──► listener (subscribe)
//     signal b ──┘
//
//   - "produtor" = quem é lido (a, b, soma);  "consumidor" = quem lê (soma, dobro).
//   - Um derived é as duas coisas: consome a/b e produz para dobro.
//
// O algoritmo é "push-pull":
//   - PUSH (na escrita): `a.set(…)` só MARCA como sujos os consumidores que estão ouvindo
//     ("vivos"). Não recalcula nada — é barato, mesmo com milhares de nós.
//   - PULL (na leitura): quando alguém lê `dobro()`, ele confere se alguma dependência mudou
//     desde a última vez e só então recalcula — de baixo para cima, só o necessário.
//
// Três ideias sustentam isso:
//   1. VERSÃO: cada nó tem `#version`, que só sobe quando o valor muda de fato. Um consumidor
//      guarda (no link) a versão de cada produtor que leu; se bater, aquele produtor não mudou.
//   2. ÉPOCA: um contador global (`epoch`) que sobe a cada escrita em qualquer lugar. Se nenhuma
//      escrita aconteceu desde a última conferência, a leitura nem olha as dependências.
//   3. CONSUMIDOR ATIVO: enquanto um derived calcula, ele fica em `activeConsumer`. Toda leitura
//      nesse intervalo pergunta "tem alguém calculando?" e, se tiver, vira dependência dele.
//      É assim que as dependências são descobertas sem ninguém declará-las.
// ═════════════════════════════════════════════════════════════════════════════════════════════

const { DIRTY, MUST_RECOMPUTE, HAS_VALUE, COMPUTING, QUEUED } = NODE_FLAGS;

// ── estado global do módulo ──────────────────────────────────────────────────────────────────
// Ficam fora da classe porque são compartilhados por TODOS os nós (é um grafo só).

// Derived que está rodando o `compute` agora. `null` = ninguém está calculando (leitura comum,
// fora de um derived — não registra dependência). Derived dentro de derived empilha: cada
// `#recompute` guarda o anterior e restaura no fim (ver `previousConsumer`).
let activeConsumer: ReactiveNode<any> | null = null;

// Sobe a cada escrita em qualquer signal. Um nó que anota "conferi na época 42" e encontra
// `epoch === 42` sabe que nada foi escrito desde então — pode devolver o valor guardado direto.
let epoch = 0;

// Numera cada execução de `compute` (todas as execuções de todos os derived, em sequência).
// Serve para reconhecer "este produtor já foi registrado NESTA execução" (ver `#track`).
let runCounter = 0;

// Profundidade de `batch` aninhados. Enquanto > 0, os listeners esperam o lote mais externo acabar.
let batchDepth = 0;

// `true` enquanto `#flush` está chamando listeners — evita reentrar no flush se um listener
// escrever em outro signal (a escrita só enfileira; o laço em andamento pega o novo item).
let flushing = false;

// Fila de nós com listeners a notificar. Preenchida durante a propagação, esvaziada no flush.
// Os listeners rodam só DEPOIS que a propagação inteira terminou: assim um listener nunca lê
// um grafo "meio marcado" (com parte dos nós ainda não avisada da mudança).
const pending: (ReactiveNode<any> | undefined)[] = [];

// Pilha manual usada por `#propagate` — reaproveitada entre chamadas (não aloca a cada escrita)
// e sem recursão, então uma cadeia de 100 mil derived vivos não estoura a pilha do JS.
const propagateStack: (Link | undefined)[] = [];

/**
 * @internal
 * Aresta produtor → consumidor. Fica em duas listas ligadas ao mesmo tempo: nos `producers` do
 * consumidor (sempre) e nos `consumers` do produtor (só enquanto o consumidor está "vivo").
 */
// Por que duas listas?
//   - `producers` (do consumidor): "de quem eu dependo" — usada no PULL, para conferir versões.
//     Existe sempre que o derived já calculou alguma vez.
//   - `consumers` (do produtor): "quem depende de mim" — usada no PUSH, para marcar sujos.
//     Só existe para consumidores VIVOS. Um derived que ninguém ouve não aparece aqui, então o
//     produtor não o mantém na memória: se o derived não tiver mais referências, o GC o coleta.
//
// Exemplo — `soma = derived(() => a() + b())`, com alguém ouvindo `soma`:
//
//     soma.#producers:  [link(a)] ──nextProducer──► [link(b)]
//     a.#consumers:     [link(a)]            (o MESMO objeto link, visto do lado de `a`)
//     b.#consumers:     [link(b)]
class Link {
	// Vizinhos na lista `consumers` do produtor (duplamente ligada: remoção em O(1)).
	prevConsumer: Link | undefined = undefined;
	nextConsumer: Link | undefined = undefined;

	constructor(
		public producer: ReactiveNode<any>,
		public consumer: ReactiveNode<any>,
		// Versão do produtor na última vez que o consumidor o leu. Se `producer.#version` for
		// diferente disto, o produtor mudou desde então.
		public lastReadVersion: number,
		// Próximo na lista `producers` do consumidor (simplesmente ligada, na ordem de leitura).
		public nextProducer: Link | undefined
	) {}
}

/**
 * @internal
 * Nó do grafo reativo — a mesma classe serve de fonte (`compute` ausente) e de derivado, para
 * que todos os nós tenham o mesmo formato e os acessos nos laços do grafo fiquem monomórficos.
 *
 * Modelo push-pull com versões (o mesmo do Angular):
 * - escrita: incrementa `version` da fonte e marca `DIRTY` só nos consumidores vivos;
 * - leitura: um derivado confere se a versão de alguma dependência mudou antes de recomputar;
 * - recomputar para um valor igual (`equal`) não incrementa `version` — quem depende dele não recomputa.
 */
class ReactiveNode<T> {
	// ── dados ────────────────────────────────────────────────────────────────────────────────

	// Valor atual. Num derived que ainda não calculou, é `undefined` (e `HAS_VALUE` está desligado).
	#value: T;
	// A função do derived. `undefined` = este nó é uma FONTE (signal) — é assim que se diferencia
	// fonte de derivado sem precisar de duas classes.
	readonly #compute: (() => T) | undefined;
	// "Mudou?" — por padrão `Object.is`. Se `equal(antigo, novo)` for true, não conta como mudança.
	readonly #equal: TEqual<T>;
	// Cinco booleanos num inteiro só (ver `NODE_FLAGS` em `declarations.ts`). Ex.: `flags & DIRTY`
	// lê o bit; `flags |= DIRTY` liga; `flags &= ~DIRTY` desliga.
	#flags: number;

	// ── controle de mudança ──────────────────────────────────────────────────────────────────

	// Sobe só quando o valor muda de fato. Consumidores comparam com `link.lastReadVersion`.
	#version = 0;
	// Em que `epoch` este nó foi conferido pela última vez. `=== epoch` → está atualizado.
	// `-1` = "nunca" / "force a conferir de novo" (usado depois de erro e de `dispose`).
	#lastCleanEpoch = -1;
	// Versão do valor que os listeners viram por último. Se o derived recalcular e a versão
	// continuar igual a esta (valor igual), os listeners não são chamados.
	#emittedVersion = -1;
	// Como consumidor: número da execução atual/última do `compute` (vem de `runCounter`).
	#runId = 0;
	// Como produtor: `#runId` do último consumidor que o registrou (detecta leitura repetida).
	#trackedInRun = 0;

	// ── ligações no grafo ────────────────────────────────────────────────────────────────────

	// De quem eu dependo, na ordem em que li. `#producersTail` marca até onde a execução
	// atual já passou — durante o `compute` a lista é reconstruída NO LUGAR a partir daqui.
	#producers: Link | undefined = undefined;
	#producersTail: Link | undefined = undefined;
	// Quem depende de mim e está vivo (recebe push). Duplamente ligada via `Link.prevConsumer/nextConsumer`.
	#consumers: Link | undefined = undefined;
	#consumersTail: Link | undefined = undefined;
	// Listeners externos (`subscribe`): `undefined`, uma função ou um array — ver `ListenerUtils`.
	#listeners: TListeners<T> = undefined;

	// Privado: só se cria por `source`/`derived`, que deixam claro qual dos dois tipos é.
	private constructor(value: T, compute: (() => T) | undefined, equal: TEqual<T>) {
		this.#value = value;
		this.#compute = compute;
		this.#equal = equal;
		// Fonte já nasce com valor. Derived nasce "precisa calcular" — e só calcula quando for lido
		// pela primeira vez (preguiçoso: um derived nunca lido nunca roda o `compute`).
		this.#flags = compute === undefined ? HAS_VALUE : MUST_RECOMPUTE;
	}

	static source<T>(value: T, equal: TEqual<T> = Object.is): ReactiveNode<T> {
		return new ReactiveNode(value, undefined, equal);
	}

	static derived<T>(compute: () => T, equal: TEqual<T> = Object.is): ReactiveNode<T> {
		return new ReactiveNode(undefined as T, compute, equal);
	}

	// ═════════════════════════════════════════════════════════════════════════════════════════
	// LEITURA (pull)
	// ═════════════════════════════════════════════════════════════════════════════════════════

	// O que roda em `x()`. Duas tarefas:
	//   1. se for derived e puder estar desatualizado → `#refresh` (confere e, se preciso, recalcula);
	//   2. se tem um derived calculando agora → registra este nó como dependência dele.
	read(): T {
		// As duas checagens mais frequentes ficam aqui fora para a leitura comum não chamar nada:
		// fonte (`#compute === undefined`) ou derived já conferido nesta época → valor direto.
		if (this.#compute !== undefined && this.#lastCleanEpoch !== epoch) this.#refresh();
		if (activeConsumer !== null) ReactiveNode.#track(this);
		return this.#value;
	}

	// Igual a `read`, mas sem registrar dependência (usado internamente por `update`).
	peek(): T {
		if (this.#compute !== undefined && this.#lastCleanEpoch !== epoch) this.#refresh();
		return this.#value;
	}

	// Garante que `#value`/`#version` estão atualizados, recomputando só se alguma dependência mudou.
	//
	// Ordem das perguntas (da mais barata para a mais cara):
	//   a) conferido nesta época?          → nada foi escrito desde então: pronto.
	//   b) estou no meio do meu cálculo?   → alguém me leu de dentro de mim mesmo: ciclo, erro.
	//   c) vivo e não sujo?                → se algo tivesse mudado, o push teria me marcado: pronto.
	//   d) nunca calculei (ou deu erro)?   → calcula.
	//   e) alguma dependência mudou?       → calcula. (`#producersChanged` — o passo caro)
	// Em todos os casos, termina anotando "conferido nesta época" e desligando `DIRTY`.
	#refresh(): void {
		if (this.#lastCleanEpoch === epoch) return;
		const flags = this.#flags;
		if (flags & COMPUTING) throw new LocaleError(SIGNAL_LOCALES, 'cycle');
		// Vivo e limpo: qualquer mudança nas dependências já teria marcado `DIRTY`.
		const cleanAndLive = !(flags & DIRTY) && this.#isLive();
		if (!cleanAndLive && (flags & MUST_RECOMPUTE || this.#producersChanged())) this.#recompute();
		this.#flags &= ~DIRTY;
		this.#lastCleanEpoch = epoch;
	}

	// Roda o `compute` do usuário e atualiza valor/versão. Durante a execução:
	//   - este nó vira o `activeConsumer` (leituras lá dentro viram dependências dele);
	//   - a lista de produtores é refeita do zero, reaproveitando links (ver `#track`);
	//   - o bit `COMPUTING` fica ligado (para detectar ciclo).
	#recompute(): void {
		// Derived dentro de derived: guarda quem estava calculando para devolver no final.
		// Ex.: `dobro` calcula → lê `soma()` → `soma` recalcula (ativo = soma) → termina →
		// ativo volta a ser `dobro`, e as leituras seguintes voltam a contar para `dobro`.
		const previousConsumer = activeConsumer;
		activeConsumer = this;
		// Recomeça a lista de dependências: o tail volta ao início; cada leitura avança o tail.
		this.#producersTail = undefined;
		// Número novo desta execução — `#track` usa para não registrar o mesmo produtor 2x.
		this.#runId = ++runCounter;
		this.#flags |= COMPUTING;
		let next: T;
		let equal = false;
		try {
			next = this.#compute!();
			// `equal` é código do usuário: roda sem consumidor ativo para não criar dependência.
			activeConsumer = null;
			// Só compara se já existe um valor anterior válido (o 1º cálculo é sempre "mudança").
			equal = (this.#flags & HAS_VALUE) !== 0 && this.#equal(this.#value, next);
		} catch (error) {
			// Sem isso, a próxima leitura devolveria o valor antigo como se fosse válido: as
			// dependências não mudariam de novo, então `#producersChanged` diria "nada mudou".
			// `MUST_RECOMPUTE` força tentar outra vez na próxima leitura.
			this.#flags = (this.#flags & ~COMPUTING) | MUST_RECOMPUTE;
			this.#lastCleanEpoch = -1;
			throw error;
		} finally {
			// Roda com ou sem erro: devolve o consumidor anterior e descarta as dependências da
			// execução passada que desta vez não foram lidas (ex.: o outro ramo de um `if`).
			activeConsumer = previousConsumer;
			this.#dropUnreadProducers();
		}
		this.#flags = (this.#flags & ~(COMPUTING | MUST_RECOMPUTE)) | HAS_VALUE;
		// CORTE POR IGUALDADE: valor igual → a versão NÃO sobe → quem depende deste nó vai achar
		// `lastReadVersion === #version` e não vai recalcular. É o que impede a mudança de
		// "vazar" pela cadeia quando o resultado intermediário não mudou.
		// Ex.: `par = derived(() => n() % 2 === 0)`; n: 2 → 4 → `par` recalcula, continua `true`,
		// versão igual → tudo que depende de `par` fica como está.
		if (equal) return;
		this.#value = next;
		this.#version++;
	}

	// "Alguma das minhas dependências mudou desde a última vez que eu li?"
	// Percorre as dependências na ordem em que foram lidas e para na primeira que mudou.
	#producersChanged(): boolean {
		for (let link = this.#producers; link !== undefined; link = link.nextProducer) {
			const producer = link.producer;
			// Caso rápido: a versão já é outra → mudou.
			if (link.lastReadVersion !== producer.#version) return true;
			// Mesma versão da última leitura, mas o produtor pode estar desatualizado — atualiza e confere de novo.
			// (Se o produtor é um derived, a versão dele só sobe quando ELE for conferido. Por
			// isso a conferência desce recursivamente: é o "pull" indo até as fontes.)
			if (producer.#compute !== undefined) producer.#refresh();
			if (link.lastReadVersion !== producer.#version) return true;
		}
		return false;
	}

	// ═════════════════════════════════════════════════════════════════════════════════════════
	// RASTREAMENTO DE DEPENDÊNCIAS (quem leu quem)
	// ═════════════════════════════════════════════════════════════════════════════════════════

	// Registra `producer` como dependência do `activeConsumer`. A lista de produtores é reconstruída
	// no lugar: se a leitura bate com o próximo link da execução anterior, o link é reaproveitado.
	//
	// Na prática, um derived costuma ler as mesmas coisas na mesma ordem toda vez. Então, em vez
	// de jogar a lista fora e criar links novos a cada cálculo, o tail avança sobre a lista antiga
	// conferindo "a próxima leitura é o mesmo produtor de antes?". Exemplo, `x = f() ? a() : b()`:
	//
	//   execução 1 leu:  f, a         lista: [f] → [a]
	//   execução 2 leu:  f, b         [f] bate (reaproveita); [a] ≠ b → cria [b] ANTES de [a]:
	//                                 lista: [f] → [b] → [a]     (tail em [b])
	//   fim da execução 2: tudo depois do tail ([a]) não foi lido → `#dropUnreadProducers` remove.
	static #track(producer: ReactiveNode<any>): void {
		const consumer = activeConsumer!;
		const runId = consumer.#runId;
		// Já registrado nesta execução (ex.: `a() + b() + a()`) — não cria link repetido.
		// Como `runId` é único por execução, "o produtor foi marcado com o meu runId" só é
		// verdade se ele já foi lido por mim nesta mesma execução.
		if (producer.#trackedInRun === runId) return;
		producer.#trackedInRun = runId;

		// `next` = o link que estava logo depois do tail na execução anterior (candidato a reaproveitar).
		const tail = consumer.#producersTail;
		const next = tail !== undefined ? tail.nextProducer : consumer.#producers;
		if (next !== undefined && next.producer === producer) {
			// Mesma dependência, mesma posição: só atualiza a versão lida e avança o tail.
			next.lastReadVersion = producer.#version;
			consumer.#producersTail = next;
			return;
		}

		// Dependência nova (ou em outra ordem): insere antes de `next`; os links antigos que não
		// forem lidos até o fim ficam depois do tail e são removidos em `#dropUnreadProducers`.
		const link = new Link(producer, consumer, producer.#version, next);
		if (tail !== undefined) tail.nextProducer = link;
		else consumer.#producers = link;
		consumer.#producersTail = link;
		// Se o consumidor está vivo, o produtor precisa conhecê-lo para mandar push.
		if (consumer.#isLive()) producer.#addLiveConsumer(link);
	}

	// Chamado no fim de todo `#recompute`: corta a lista de produtores no tail. O que estava
	// depois dele era dependência da execução anterior que não foi lida nesta.
	#dropUnreadProducers(): void {
		const tail = this.#producersTail;
		let unread = tail !== undefined ? tail.nextProducer : this.#producers;
		if (unread === undefined) return;
		// Se sou vivo, esses produtores me conhecem (estou na lista `consumers` deles) — preciso
		// sair de lá também, senão eles continuariam me mandando push por algo que não leio mais.
		if (this.#isLive()) {
			while (unread !== undefined) unread = ReactiveNode.#removeLiveLink(unread);
		}
		if (tail !== undefined) tail.nextProducer = undefined;
		else this.#producers = undefined;
	}

	// ═════════════════════════════════════════════════════════════════════════════════════════
	// NÓS VIVOS (recebem push)
	//
	// "Vivo" = alguém está ouvindo este nó: um listener (`subscribe`) ou outro nó vivo que depende
	// dele. Só nós vivos ficam registrados nos produtores e recebem `DIRTY` na escrita.
	//
	// Por que nem todo nó é vivo? Memória. Se todo derived se pendurasse nas suas fontes, uma fonte
	// de vida longa manteria na memória todo derived que já a leu — mesmo os que ninguém usa mais.
	// Um derived não vivo não é conhecido por ninguém "acima" dele; ele mesmo confere as versões
	// quando for lido (pull). Um vivo pode confiar no `DIRTY` e pular essa conferência.
	//
	// Ficar vivo é contagioso para cima: se `dobro` passa a ser ouvido, `soma` (que `dobro` lê)
	// também precisa ficar vivo, senão a escrita em `a` não chegaria até `dobro`. O inverso também:
	// quando o último ouvinte sai, o nó "adormece" e sai das listas dos seus produtores.
	// ═════════════════════════════════════════════════════════════════════════════════════════

	#isLive(): boolean {
		return this.#consumers !== undefined || this.#listeners !== undefined;
	}

	// Pendura `link` na lista de consumidores; se este nó acabou de ficar vivo, se pendura nos seus produtores.
	#addLiveConsumer(link: Link): void {
		const wasLive = this.#isLive();
		const tail = this.#consumersTail;
		link.prevConsumer = tail;
		link.nextConsumer = undefined;
		if (tail !== undefined) tail.nextConsumer = link;
		else this.#consumers = link;
		this.#consumersTail = link;
		// Primeiro consumidor vivo: eu viro vivo agora, então preciso avisar meus produtores.
		if (!wasLive) this.#goLive();
	}

	// Registra este nó na lista `consumers` de cada produtor dele (e, em cascata, dos produtores
	// deles — `#addLiveConsumer` chama `#goLive` de novo em quem acabou de acordar).
	#goLive(): void {
		for (let link = this.#producers; link !== undefined; link = link.nextProducer) {
			link.producer.#addLiveConsumer(link);
		}
	}

	// O contrário de `#goLive`: sai da lista `consumers` de cada produtor. Os links continuam na
	// minha lista `producers` — eu ainda sei de quem dependo, só deixo de receber push.
	#goDormant(): void {
		let link = this.#producers;
		while (link !== undefined) link = ReactiveNode.#removeLiveLink(link);
	}

	// Tira `link` da lista de consumidores do produtor; devolve o próximo produtor do consumidor.
	// Remoção de lista duplamente ligada: liga o anterior ao próximo (e ajusta cabeça/cauda).
	// Se o produtor ficou sem ninguém ouvindo, ele também adormece (cascata para cima).
	static #removeLiveLink(link: Link): Link | undefined {
		const producer = link.producer;
		const { prevConsumer, nextConsumer, nextProducer } = link;
		link.prevConsumer = link.nextConsumer = undefined;
		if (nextConsumer !== undefined) nextConsumer.prevConsumer = prevConsumer;
		else producer.#consumersTail = prevConsumer;
		if (prevConsumer !== undefined) prevConsumer.nextConsumer = nextConsumer;
		else {
			producer.#consumers = nextConsumer;
			if (!producer.#isLive()) producer.#goDormant();
		}
		return nextProducer;
	}

	// ═════════════════════════════════════════════════════════════════════════════════════════
	// ESCRITA E PROPAGAÇÃO (push)
	// ═════════════════════════════════════════════════════════════════════════════════════════

	write(next: T): boolean {
		// Escrever durante o cálculo de um derived é proibido: derived é preguiçoso (o efeito
		// dependeria de QUANDO alguém lê), pode deixar o próprio derived inconsistente e faria
		// listeners rodarem no meio de um cálculo. Efeito colateral vai em `subscribe`.
		// (`untracked` zera o `activeConsumer`, por isso funciona como escape.)
		if (activeConsumer !== null) throw new LocaleError(SIGNAL_LOCALES, 'writeInDerived');
		if (this.#equal(this.#value, next)) return false;
		this.#value = next;
		this.#changed();
		return true;
	}

	// Mutação no lugar: o valor guardado já foi alterado por fora — só avisa, sem comparar.
	// Ex.: `keys().add('a'); keys.notify()` — o Set é o mesmo objeto, então `set` acharia "igual".
	notify(): void {
		if (activeConsumer !== null) throw new LocaleError(SIGNAL_LOCALES, 'writeInDerived');
		this.#changed();
	}

	// Os três passos de toda mudança numa fonte:
	//   1. versão e época sobem (leituras futuras vão perceber que algo mudou);
	//   2. marca `DIRTY` em todo consumidor vivo alcançável e enfileira quem tem listener;
	//   3. chama os listeners (a menos que esteja dentro de um `batch`).
	#changed(): void {
		this.#version++;
		epoch++;
		if (this.#listeners !== undefined) this.#enqueue();
		ReactiveNode.#propagate(this);
		ReactiveNode.#flush();
	}

	// Marca `DIRTY` em todos os consumidores vivos alcançáveis — iterativo, sem recomputar nada.
	//
	// É uma busca em profundidade com pilha manual. `link` percorre uma lista `consumers`; ao
	// entrar num consumidor que tem consumidores próprios, guarda na pilha "onde eu parei" (o
	// próximo irmão) e desce. Quando a lista acaba, volta para o último ponto guardado.
	//
	// Um nó que já está `DIRTY` não é visitado de novo: tudo abaixo dele já foi marcado na
	// primeira vez (é isso que torna barato um diamante — `a → b, c → d` marca `d` uma vez só).
	static #propagate(source: ReactiveNode<any>): void {
		const stack = propagateStack;
		let top = 0;
		let link = source.#consumers;
		for (;;) {
			while (link !== undefined) {
				const consumer = link.consumer;
				if (!(consumer.#flags & DIRTY)) {
					consumer.#flags |= DIRTY;
					if (consumer.#listeners !== undefined) consumer.#enqueue();
					if (consumer.#consumers !== undefined) {
						// Desce: guarda o próximo irmão para continuar depois.
						stack[top++] = link.nextConsumer;
						link = consumer.#consumers;
						continue;
					}
				}
				link = link.nextConsumer;
			}
			if (top === 0) return;
			// Sobe: retoma do irmão guardado. Limpa a posição para a pilha (reaproveitada entre
			// escritas) não segurar referências a links antigos.
			link = stack[--top];
			stack[top] = undefined;
		}
	}

	// Coloca na fila de notificação (uma vez só por flush — o bit `QUEUED` evita duplicar).
	#enqueue(): void {
		if (this.#flags & QUEUED) return;
		this.#flags |= QUEUED;
		pending.push(this);
	}

	// Esvazia a fila chamando os listeners. Não roda se estiver dentro de um `batch` (o `batch`
	// chama no final) nem se já estiver rodando (um listener que escreve só aumenta a fila, e o
	// laço abaixo pega os itens novos porque confere `pending.length` a cada volta).
	static #flush(): void {
		if (batchDepth > 0 || flushing) return;
		flushing = true;
		// Erros de listeners são juntados e lançados só no fim: um listener quebrado não impede
		// os outros de rodar, nem deixa nós presos com o bit `QUEUED` ligado.
		const errors: unknown[] = [];
		try {
			// `pending` pode crescer durante o laço (listener que escreve em outro signal).
			for (let i = 0; i < pending.length; i++) {
				const node = pending[i]!;
				pending[i] = undefined;
				node.#flags &= ~QUEUED;
				try {
					node.#emit(errors);
				} catch (error) {
					errors.push(error); // erro no recálculo de um derived não impede os outros nós
				}
			}
		} finally {
			pending.length = 0;
			flushing = false;
		}
		ListenerUtils.throwAll(errors);
	}

	// Derivados só notificam se o valor mudou de fato (recomputa agora e compara a versão).
	// Fonte: notifica sempre (a escrita já passou pelo `equal` em `write`).
	#emit(errors: unknown[]): void {
		if (this.#listeners === undefined) return;
		if (this.#compute !== undefined) {
			this.#refresh();
			if (this.#version === this.#emittedVersion) return;
			this.#emittedVersion = this.#version;
		}
		ListenerUtils.call(this.#listeners, this.#value, errors);
	}

	// ═════════════════════════════════════════════════════════════════════════════════════════
	// ASSINATURA EXTERNA (subscribe)
	// ═════════════════════════════════════════════════════════════════════════════════════════

	subscribe(listener: TValueListener<T>): TValueUnsubscribe {
		const wasLive = this.#isLive();
		if (this.#compute !== undefined && this.#listeners === undefined) {
			// Precisa estar atualizado antes de virar vivo (um nó vivo e limpo é tido como atualizado),
			// e a versão atual vira a referência do "mudou?" — mesmo que já estivesse vivo por consumidores.
			this.#refresh();
			this.#emittedVersion = this.#version;
		}
		this.#listeners = ListenerUtils.add(this.#listeners, listener);
		if (!wasLive) this.#goLive();
		// A flag `active` torna o unsubscribe idempotente: chamar duas vezes não remove uma
		// segunda inscrição do mesmo listener por engano.
		let active = true;
		return () => {
			if (!active) return;
			active = false;
			this.#unsubscribe(listener);
		};
	}

	#unsubscribe(listener: TValueListener<T>): void {
		this.#listeners = ListenerUtils.remove(this.#listeners, listener);
		// Último ouvinte saiu (e ninguém mais depende de mim): adormece e libera os produtores.
		if (!this.#isLive()) this.#goDormant();
	}

	// Desliga o nó do grafo nas duas direções (como o `consumerDestroy` do Angular).
	// Depois disso, se o derived for lido de novo, ele recalcula do zero e se religa como não vivo.
	dispose(): void {
		if (this.#isLive()) this.#goDormant();
		this.#listeners = undefined;
		this.#producers = this.#producersTail = undefined;
		this.#consumers = this.#consumersTail = undefined;
		if (this.#compute !== undefined) this.#flags |= MUST_RECOMPUTE;
		this.#lastCleanEpoch = -1;
	}

	// ═════════════════════════════════════════════════════════════════════════════════════════
	// CONTEXTO
	// ═════════════════════════════════════════════════════════════════════════════════════════

	// Roda `fn` como se ninguém estivesse calculando: leituras lá dentro não viram dependência
	// (e escritas são permitidas — é o escape da trava de escrita).
	static untracked<R>(fn: () => R): R {
		const previousConsumer = activeConsumer;
		activeConsumer = null;
		try {
			return fn();
		} finally {
			activeConsumer = previousConsumer;
		}
	}

	// Agrupa escritas: os listeners só são chamados uma vez, quando o lote mais externo termina.
	// As marcações `DIRTY` continuam acontecendo na hora (leituras dentro do lote veem valores
	// atualizados); só a chamada dos listeners é adiada.
	static batch<R>(fn: () => R): R {
		batchDepth++;
		try {
			return fn();
		} finally {
			batchDepth--;
			ReactiveNode.#flush();
		}
	}
}

export { ReactiveNode };
