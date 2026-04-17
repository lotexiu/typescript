import type {
	CompactTrieNode,
	CompactTrieRoot,
	Match,
	SearchResult,
	RootMetadata,
} from "./types";

// Cria um nó vazio
function createNode(): CompactTrieNode {
	return {
		children: null,
		outputs: null,
	};
}

// Adiciona índice de padrão aos outputs do nó
// Otimização: armazena scalar quando há 1 padrão, array quando há vários
function addOutput(node: CompactTrieNode, patternIndex: number): void {
	if (node.outputs === null) {
		node.outputs = patternIndex;
		return;
	}

	if (Array.isArray(node.outputs)) {
		node.outputs.push(patternIndex);
		return;
	}

	node.outputs = [node.outputs, patternIndex];
}

/**
 * Constrói a trie compacta a partir dos padrões.
 * Diferente do Aho-Corasick: sem links de falha, estrutura mais simples.
 */
function charNodes(...patterns: string[]): CompactTrieRoot {
	const root: CompactTrieRoot = Object.create(null);
	const lengths = new Array<number>(patterns.length);

	root.__meta = {
		lengths,
		patternCount: patterns.length,
	};

	for (
		let patternIndex = 0;
		patternIndex < patterns.length;
		patternIndex += 1
	) {
		const pattern = patterns[patternIndex];

		if (typeof pattern !== "string" || pattern.length === 0) {
			throw new Error("Todos os padrões devem ser strings não vazias.");
		}

		lengths[patternIndex] = pattern.length;

		let node: CompactTrieNode | undefined = root[pattern[0]];

		if (!node) {
			node = createNode();
			(root as Record<string, any>)[pattern[0]] = node;
		}

		// Percorre os caracteres restantes
		for (let offset = 1; offset < pattern.length; offset += 1) {
			const char = pattern[offset];

			if (!node.children) {
				node.children = Object.create(null);
			}

			const children = node.children as Record<string, CompactTrieNode>;
			let nextNode: CompactTrieNode | undefined = children[char];

			if (!nextNode) {
				nextNode = createNode();
				children[char] = nextNode;
			}

			node = nextNode;
		}

		addOutput(node, patternIndex);
	}

	return root;
}

// Constrói objeto de correspondência
function buildMatch(
	patternIndex: number,
	startIndex: number,
	length: number,
	patterns?: string[],
): Match {
	const match: Match = {
		patternIndex,
		index: startIndex,
		end: startIndex + length - 1,
		length,
	};

	if (patterns) {
		match.pattern = patterns[patternIndex];
	}

	return match;
}

/**
 * Busca todos os padrões no texto.
 * Diferente do Aho-Corasick: sem links de falha, recomeça em cada posição.
 */
function search(
	text: string,
	patterns?: string[],
): SearchResult {
	const root: CompactTrieRoot = charNodes(...(patterns || []));
	const meta = root.__meta as RootMetadata | undefined;

	if (!meta) {
		throw new Error("Raiz de trie inválida: falta __meta");
	}

	const matches: Match[] = [];

	for (let startIndex = 0; startIndex < text.length; startIndex += 1) {
		let node: CompactTrieNode | undefined = root[text[startIndex]];

		if (!node) {
			continue;
		}

		let depth = 1;

		while (node !== undefined) {
			if (node.outputs !== null) {
				if (Array.isArray(node.outputs)) {
					for (const patternIndex of node.outputs) {
						const length = meta.lengths[patternIndex];
						matches.push(
							buildMatch(patternIndex, startIndex, length, patterns),
						);
					}
				} else {
					const patternIndex = node.outputs;
					const length = meta.lengths[patternIndex];
					matches.push(buildMatch(patternIndex, startIndex, length, patterns));
				}
			}

			if (!node.children || startIndex + depth >= text.length) {
				break;
			}

			node = node.children[text[startIndex + depth]];
			depth += 1;
		}
	}

	return {
		matches,
		totalMatches: matches.length,
	};
}

export {
	search,
	charNodes
}
