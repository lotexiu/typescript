import { TAstVisitor } from "./types";

/**
 * Nó genérico de uma árvore sintática. `kind` é uma string livre definida pela gramática
 * que o produziu — o motor não conhece nenhum vocabulário fixo. Guarda apenas offsets no
 * source da raiz (flyweight); `text` fatia sob demanda, igual `ParserNode.content`.
 */
class AstNode {
	/** Filhos diretos, em ordem de fonte. */
	readonly children: AstNode[] = []
	/** Filhos indexados por papel — `field('name', ...)` na gramática popula isto. */
	readonly fields = new Map<string, AstNode | AstNode[]>()
	/** Nó pai, ou a raiz para nós de topo. Definido quando o nó é anexado. */
	parent: AstNode | AstRoot | undefined
	private _text?: string

	constructor(
		readonly kind: string,
		readonly root: AstRoot,
		public start: number,
		public end: number,
		/** Texto pré-definido (folhas guardam o `value` do token); ausente = fatiar de `root.source`. */
		text?: string,
	) {
		this._text = text
	}

	/** Fatia de `root.source` coberta por este nó — computada e cacheada no 1º acesso. */
	get text(): string {
		return this._text ??= this.root.source.slice(this.start, this.end)
	}

	/** Primeiro filho registrado no campo `name` (ou `undefined`). */
	field(name: string): AstNode | undefined {
		const value = this.fields.get(name)
		return Array.isArray(value) ? value[0] : value
	}

	/** Todos os nós registrados no campo `name` (lista vazia se não houver). */
	fieldList(name: string): AstNode[] {
		const value = this.fields.get(name)
		return value === undefined ? [] : Array.isArray(value) ? value : [value]
	}

	/** Primeiro filho direto de um dado `kind`. */
	child(kind: string): AstNode | undefined {
		return this.children.find((child) => child.kind === kind)
	}

	/** Percorre este nó e a subárvore em pré-ordem; retornar `false` no visitor poda os filhos. */
	walk(visitor: TAstVisitor): void {
		if (visitor(this) === false) return
		for (const child of this.children) child.walk(visitor)
	}
}

/**
 * Raiz de uma árvore sintática — dona do `source` (fonte única da verdade para os
 * flyweights) e dos índices de navegação.
 */
class AstRoot {
	/** Nós de topo (o que a regra-start devolveu). */
	readonly children: AstNode[] = []
	/** Todos os nós compostos da árvore, de qualquer profundidade — ordem de criação. */
	readonly nodes: AstNode[] = []

	constructor(readonly source: string) {}

	/** Percorre toda a árvore em pré-ordem; retornar `false` no visitor poda os filhos. */
	walk(visitor: TAstVisitor): void {
		for (const child of this.children) child.walk(visitor)
	}
}

export {
	AstNode,
	AstRoot,
}
