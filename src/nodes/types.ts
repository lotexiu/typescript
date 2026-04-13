import { FinalNode, MiddleNode, RootNode } from "./Node";

type TOnPatternFound = (match: TMatchResult) => void;

type TMatch = (char: string, index: number) => boolean;

type TPatternHandlers<T = TOnPatternFound> = Record<string, T>;

type TNodeKey = string | number;

// Qualquer nó, incluindo raiz
type TNode<C> = RootNode<C> | MiddleNode<C> | FinalNode<C>;

// Qualquer nó filho (nunca RootNode)
type TNextNode<C> = MiddleNode<C> | FinalNode<C>;

// Estrutura de filhos baseada em Map (chave = caractere)
interface TNodeChildrensMap {
	[key: string]: TNextNode<TNodeChildrensMap>;
}

// Estrutura de filhos baseada em Array
type TNodeChildrensArray = TNextNode<TNodeChildrensArray>[];

type TNodeChildrens = TNodeChildrensMap | TNodeChildrensArray;

type TMatchResult = {
	pattern: string;
	value: string;
	location: [number, number]; // [inicio, fim] (ambos inclusivos)
};

export {
	TOnPatternFound,
	TMatch,
	TPatternHandlers,
	TNodeKey,
	TNextNode,
	TNode,
	TMatchResult,
	TNodeChildrensMap,
	TNodeChildrensArray,
	TNodeChildrens,
};
