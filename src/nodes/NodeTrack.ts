import { FinalNode, RootNode } from "./Node";
import { TNode, TPatternHandlers } from "./types";

abstract class NodeTrack<C> {
	protected root = this.initRoot();
	content?: string;

	private node: TNode<C> = this.root;
	private patternsCallbacks: TPatternHandlers = {};
	private dirty = false;

	abstract initRoot(): RootNode<C>;
	abstract genNodes(): void;

	// Dado o nó atual e o próximo caractere, retorna o próximo nó.
	// A implementação concreta cuida de como percorrer filhos e failure links.
	abstract nextNode(node: TNode<C>, char: string): TNode<C>;

	addPatterns(patterns: TPatternHandlers) {
		for (const pattern in patterns) {
			if (!(pattern in this.patternsCallbacks)) {
				this.dirty = true;
			}
			this.patternsCallbacks[pattern] = patterns[pattern];
		}
	}

	removePatterns(patterns: string[]) {
		for (const pattern of patterns) {
			delete this.patternsCallbacks[pattern];
		}
		this.dirty = true;
	}

	cleanPatterns() {
		this.patternsCallbacks = {};
		this.dirty = true;
	}

	resolve() {
		this.resolveNodes();
		if (!this.content) return;

		const content = this.content;
		const size = content.length;

		this.node = this.root;

		for (let pos = 0; pos < size; pos++) {
			const char = content[pos];
			this.node = this.nextNode(this.node, char);

			// Um FinalNode indica que um padrão terminou em `pos`.
			// Mas outros padrões mais curtos podem também terminar aqui
			// (ex: "she" e "he" terminam no mesmo pos em "ushers").
			// Por isso percorremos os failure links enquanto houver nós,
			// disparando callback para cada FinalNode encontrado.
			if (this.node instanceof FinalNode) {
				let cursor: TNode<C> = this.node;

				while (!(cursor instanceof RootNode)) {
					if (cursor instanceof FinalNode) {
						const callback = this.patternsCallbacks[cursor.pattern];
						if (callback) {
							const start = pos - cursor.pattern.length + 1;
							callback({
								location: [start, pos],
								pattern: cursor.pattern,
								value: content.slice(start, pos + 1),
							});
						}
					}
					cursor = cursor.closestFallback;
				}
			}
		}
	}

	private resolveNodes() {
		if (!this.dirty) return;
		this.dirty = false;
		this.root = this.initRoot();
		this.genNodes();
	}

	getPattensCallbacks() {
		return this.patternsCallbacks;
	}
}

export { NodeTrack };
