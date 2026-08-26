import { LazyReadonlyValue, lazyReadonlyValue } from "@ts/lazy-readonly-value/model";

class ParserGate {
	public readonly symetric: boolean

	constructor(
		public readonly open: string,
		public readonly close: string,
		public readonly opaque: boolean = false,
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
		this.end = unclosed ? closeStart : closeStart + this.gate.close.length
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
