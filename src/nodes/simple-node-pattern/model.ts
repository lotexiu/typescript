import { FinalNode, MiddleNode, RootNode } from "@tsnode/Node";
import { NodeTrack } from "@tsnode/NodeTrack";
import { TNextNode, TNode, TNodeChildrensMap } from "@tsnode/types";

class SimplePattern extends NodeTrack<TNodeChildrensMap> {
	initRoot() {
		return new RootNode<TNodeChildrensMap>({});
	}

	// Constrói o trie completo e calcula os failure links via BFS
	// (algoritmo padrão de Aho-Corasick).
	genNodes() {
	}

	nextNode(node: TNode<TNodeChildrensMap>, char: string,): TNode<TNodeChildrensMap> {
		while (!(node instanceof RootNode) && !node.childrens[char]) {
			node = node.closestFallback;
		}
		return node.childrens[char] ?? node;
	}
}

export { SimplePattern };
