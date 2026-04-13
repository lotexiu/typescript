import { TNode } from "./types";

abstract class AbstractNode<C, T extends string = string> {
	constructor(
		readonly kind: T,
		readonly childrens: C,
	) {}
}

class RootNode<C> extends AbstractNode<C,"root"> {
	constructor(childrens: C) {
		super("root", childrens);
	}
}

// T = kind literal, C = estrutura dos filhos (ex: Map ou Array)
class MiddleNode<C, T extends string = string> extends AbstractNode<C, T> {
	constructor(
		kind: T,
		public closestFallback: TNode<C>,
		childrens: C,
	) {
		super(kind, childrens);
	}
}

// FinalNode PRECISA de childrens: em Aho-Corasick um padrão pode ser
// prefixo de outro (ex: "he" → "hers"), então o nó final ainda tem filhos.
// closestFallback também aceita FinalNode pois o failure link de "she"
// aponta para FinalNode("he").
class FinalNode<C> extends AbstractNode<C, "final"> {
	constructor(
		public pattern: string,
		public closestFallback: TNode<C>,
		childrens: C,
	) {
		super("final", childrens);
	}
}

export { AbstractNode, RootNode, MiddleNode, FinalNode };
