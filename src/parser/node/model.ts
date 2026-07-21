import { LazyReadonlyValue, lazyReadonlyValue } from "@ts/lazy-readonly-value/model";

class ParserGate {
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

class ParserGap {
	private _text?: LazyReadonlyValue<string>

	constructor(
		public readonly parent: ParserNode | ParserRoot,
		private readonly root: ParserRoot,
		public readonly start: number,
		public readonly end: number,
	) {}

	/** Cria o wrapper lazy só no primeiro acesso — evita alocar closure para gaps nunca lidos. */
	get text(): LazyReadonlyValue<string> {
		return this._text ??= lazyReadonlyValue(() => this.root.text.slice(this.start, this.end))
	}
}

class ParserNode {
	public end: number = -1
	public unclosed: boolean = false
	public readonly children: ParserNode[] = []
	public readonly gaps: ParserGap[] = []
	private _content?: LazyReadonlyValue<string>

	/** Índice onde o gate de fechamento começa (ou EOF, se unclosed) — fim do conteúdo. */
	private closeStart: number = -1

	constructor(
		public readonly parent: ParserNode | ParserRoot,
		public readonly root: ParserRoot,
		public readonly gate: ParserGate,
		public readonly start: number,
	) {
		parent.children.push(this)
	}

	get contentStart() { return this.start + this.gate.open.length }

	/** Cria o wrapper lazy só no primeiro acesso — evita alocar closure para nodes nunca lidos. */
	get content(): LazyReadonlyValue<string> {
		return this._content ??= lazyReadonlyValue(() => this.root.text.slice(this.contentStart, this.closeStart))
	}

	/** @internal chamado pelo resolve() do Parser ao fechar o nó (normal ou por EOF). */
	close(closeStart: number, unclosed: boolean) {
		this.closeStart = closeStart
		this.unclosed = unclosed
		this.end = unclosed ? closeStart
			: this.gate.consumeClose ? closeStart + this.gate.close.length
			: closeStart
	}
}

class ParserRoot {
	public readonly children: ParserNode[] = []
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
