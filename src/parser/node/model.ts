import { readonlyValue } from "@ts/composables/readonly-value/model";
import { TReadOnlyValue } from "@ts/composables/readonly-value/types";

/** Um par de delimitadores (`open`/`close`). `opaque` ignora outros gates dentro (strings, comentários). */
class ParserGate {
	/** `open` e `close` são iguais (aspas). */
	public readonly symetric: boolean

	constructor(
		public readonly open: string,
		public readonly close: string,
		public readonly opaque: boolean = false,
		/** false = fecha ao encontrar `close` sem incluí-lo no node (ex: comentário de linha terminado por `\n` — a quebra de linha não é parte do comentário). */
		public readonly consumeClose: boolean = true,
		/**
		 * Semi-transparente: o gate é opaco (ignora todo outro gate lá dentro) **exceto** pelo
		 * `open` deste `holeGate`, que abre um escopo normal (transparente) dentro dele. É o
		 * modo de template string — `` ` … ` `` opaco, mas `${ … }` volta a ser código. O
		 * `holeGate` só é reconhecido enquanto o escopo pai está aberto; nunca abre sozinho.
		 */
		public readonly holeGate: ParserGate | null = null,
	) {
		this.symetric = open === close
	}
}

/**
 * Um trecho de texto entre escopos, guardado quando `trackGaps` está ligado. O texto é fatiado só quando lido.
 */
class ParserGap {
	#text?: TReadOnlyValue<string>

	readonly #root: ParserRoot

	constructor(
		public readonly parent: ParserNode | ParserRoot,
		root: ParserRoot,
		public readonly start: number,
		public readonly end: number,
	) {
		this.#root = root
	}

	/** Cria o wrapper lazy só no primeiro acesso — evita alocar closure para gaps nunca lidos. */
	get text() {
		return this.#text ??= readonlyValue(() => this.#root.text.slice(this.start, this.end))
	}
}

/**
 * Um escopo aberto por um gate: posições, filhos, trechos entre filhos e o conteúdo (fatiado só quando lido).
 */
class ParserNode {
	/** Offset logo depois do fechamento (ou o fim do texto, se não fechou). */
	public end: number = -1
	/** O texto acabou antes do `close`. */
	public unclosed: boolean = false
	/** Escopos dentro deste. */
	public readonly children: ParserNode[] = []
	/** Trechos entre os filhos (com `trackGaps`). */
	public readonly gaps: ParserGap[] = []
	#content?: TReadOnlyValue<string>

	/** Índice onde o gate de fechamento começa (ou EOF, se unclosed) — fim do conteúdo. */
	#closeStart: number = -1

	constructor(
		public readonly parent: ParserNode | ParserRoot,
		public readonly root: ParserRoot,
		public readonly gate: ParserGate,
		public readonly start: number,
	) {
		parent.children.push(this)
	}

	/** Offset onde o conteúdo começa, depois do `open`. */
	get contentStart() { return this.start + this.gate.open.length }

	/** Cria o wrapper lazy só no primeiro acesso — evita alocar closure para nodes nunca lidos. */
	get content(): TReadOnlyValue<string> {
		return this.#content ??= readonlyValue(() => this.root.text.slice(this.contentStart, this.#closeStart))
	}

	/** @internal chamado pelo resolve() do Parser ao fechar o nó (normal ou por EOF). */
	close(closeStart: number, unclosed: boolean) {
		this.#closeStart = closeStart
		this.unclosed = unclosed
		this.end = unclosed ? closeStart
			: this.gate.consumeClose ? closeStart + this.gate.close.length
			: closeStart
	}
}

/** Raiz da árvore: o texto inteiro e todos os nós, em ordem de abertura. */
class ParserRoot {
	/** Escopos de primeiro nível. */
	public readonly children: ParserNode[] = []
	/** Todos os escopos, de todos os níveis, em ordem de abertura. */
	public readonly nodes: ParserNode[] = []
	/** Gaps diretos do escopo raiz (simétrico a `ParserNode.gaps`) — não inclui gaps de dentro de nodes. */
	public readonly gaps: ParserGap[] = []
	/** Todos os gaps da árvore, de qualquer profundidade — simétrico a `nodes` vs `children`. */
	public readonly allGaps: ParserGap[] = []

	constructor(
		public readonly text: string,
	) {}
}

export {
	ParserGate,
	ParserNode,
	ParserGap,
	ParserRoot,
}
