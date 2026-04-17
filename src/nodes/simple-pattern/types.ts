/**
 * Tipagens do Compact Trie
 */

/**
 * Metadados armazenados na raiz.
 * Evita armazenar metadados por nó (economiza memória).
 */
export interface RootMetadata {
	/** Comprimentos dos padrões, indexado por patternIndex */
	lengths: number[];
	/** Total de padrões registrados */
	patternCount: number;
}

/**
 * Estratégia de armazenamento de saída:
 * - null: sem correspondências neste nó
 * - number: índice de padrão único (evita alocação de array)
 * - number[]: múltiplos índices de padrão
 *
 * Esta otimização é fundamental para a eficiência de memória:
 * nós terminais geralmente têm 1-2 padrões.
 */
export type NodeOutput = null | number | number[];

/**
 * Um nó na trie compacta.
 * Diferente do Aho-Corasick, não possui links de falha.
 */
export interface CompactTrieNode {
	/** Nós filhos por caractere (null significa não alocado) */
	children: Record<string, CompactTrieNode> | null;
	/** Padrões que terminam neste nó */
	outputs: NodeOutput;
}

/**
 * Uma correspondência encontrada na busca.
 */
export interface Match {
	patternIndex: number;
	index: number;
	end: number;
	length: number;
	pattern?: string;
}

/**
 * Resultado da busca.
 */
export interface SearchResult {
	matches: Match[];
	totalMatches: number;
}

/**
 * Raiz da trie compacta (pode conter caracteres como chaves e __meta).
 */
export type CompactTrieRoot = Record<string, any> & {
	__meta?: RootMetadata;
};
