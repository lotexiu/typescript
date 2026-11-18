import { ASCII_ALPHABET_SIZE } from "./declarations";
import { TAhoCorasickMatch, TAhoCorasickScanHooks } from "./types";

class TrieNode {
	readonly children = new Map<number, TrieNode>();
	fail: TrieNode | null = null;
	readonly outputs: number[] = [];
	id = 0;
}

/**
 * Busca de vários padrões de uma vez num texto, em uma passada (autômato Aho-Corasick em tabelas planas).
 * @example
 * const automaton = AhoCorasick.compile('he', 'she', 'hers')
 * automaton.scan('ushers') // matches de 'she', 'he' e 'hers'
 */
class AhoCorasick {
	readonly #columnOf: Int32Array;
	readonly #width: number;
	readonly #next: Int32Array;
	readonly #outputs: readonly (readonly number[])[];
	readonly #lengths: readonly number[];

	private constructor(columnOf: Int32Array, width: number, next: Int32Array, outputs: readonly (readonly number[])[], lengths: readonly number[]) {
		this.#columnOf = columnOf;
		this.#width = width;
		this.#next = next;
		this.#outputs = outputs;
		this.#lengths = lengths;
	}

	/** Monta o autômato. O `patternId` de cada match é o índice do padrão em `patterns`. */
	static compile(...patterns: string[]): AhoCorasick {
		const root = AhoCorasick.#buildTrie(patterns);
		AhoCorasick.#linkFailures(root);
		return AhoCorasick.#flatten(root, patterns);
	}

	static #buildTrie(patterns: string[]): TrieNode {
		const root = new TrieNode();

		patterns.forEach((pattern, patternId) => {
			let node = root;
			for (let i = 0; i < pattern.length; i++) {
				const code = pattern.charCodeAt(i);
				let child = node.children.get(code);
				if (!child) {
					child = new TrieNode();
					node.children.set(code, child);
				}
				node = child;
			}
			node.outputs.push(patternId);
		});

		return root;
	}

	static #linkFailures(root: TrieNode): void {
		const queue: TrieNode[] = [];

		for (const child of root.children.values()) {
			child.fail = root;
			queue.push(child);
		}

		for (let head = 0; head < queue.length; head++) {
			const node = queue[head];
			for (const [code, child] of node.children) {
				let fallback = node.fail!;
				while (fallback !== root && !fallback.children.has(code)) {
					fallback = fallback.fail!;
				}
				child.fail = fallback.children.get(code) ?? root;
				child.outputs.push(...child.fail.outputs);
				queue.push(child);
			}
		}
	}

	static #flatten(root: TrieNode, patterns: string[]): AhoCorasick {
		const nodes: TrieNode[] = [root];
		for (let head = 0; head < nodes.length; head++) {
			const node = nodes[head];
			node.id = head;
			for (const child of node.children.values()) nodes.push(child);
		}

		const usedCodes = new Set<number>();
		for (const node of nodes) for (const code of node.children.keys()) usedCodes.add(code);
		const columns = [...usedCodes].sort((left, right) => left - right);
		const width = columns.length;
		const columnOf = new Int32Array(ASCII_ALPHABET_SIZE).fill(-1);
		columns.forEach((code, column) => {
			columnOf[code] = column;
		});

		const next = new Int32Array(nodes.length * width);
		for (const node of nodes) {
			for (let column = 0; column < width; column++) {
				const child = node.children.get(columns[column]);
				if (child) {
					next[node.id * width + column] = child.id;
				} else if (node === root) {
					next[column] = 0;
				} else {
					next[node.id * width + column] = next[node.fail!.id * width + column];
				}
			}
		}

		const outputs = nodes.map((node) => node.outputs);
		const lengths = patterns.map((pattern) => pattern.length);
		return new AhoCorasick(columnOf, width, next, outputs, lengths);
	}

	/**
	 * Procura entre `start` e `end` e devolve os matches em ordem de fim. `onMatch` é chamado a cada um (retornar `false`
	 * o deixa fora do resultado); `onPosition` pode pular trechos (retornar `N` avança `N` caracteres e reinicia o autômato).
	 * Só caracteres ASCII participam dos padrões; os demais reiniciam o autômato.
	 */
	scan(text: string, hooks: TAhoCorasickScanHooks = {}, start: number = 0, end: number = text.length): TAhoCorasickMatch[] {
		const { onPosition, onMatch } = hooks;
		const columnOf = this.#columnOf;
		const width = this.#width;
		const next = this.#next;
		const outputs = this.#outputs;
		const lengths = this.#lengths;
		const matches: TAhoCorasickMatch[] = [];
		let state = 0;

		for (let i = start; i < end; i++) {
			const code = text.charCodeAt(i);

			if (onPosition) {
				const skip = onPosition(i, code);
				if (skip) {
					i += skip - 1;
					state = 0;
					continue;
				}
			}

			const column = code < ASCII_ALPHABET_SIZE ? columnOf[code] : -1;
			state = column < 0 ? 0 : next[state * width + column];

			const ending = outputs[state];
			if (ending.length) {
				const matchEnd = i + 1;
				for (const patternId of ending) {
					const matchStart = matchEnd - lengths[patternId];
					if (onMatch && onMatch(patternId, matchStart, matchEnd) === false) continue;
					matches.push({ patternId, start: matchStart, end: matchEnd });
				}
			}
		}

		return matches;
	}
}

export { AhoCorasick };
