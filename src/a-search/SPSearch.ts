import { TNullable } from "@ts/types";
import { BPSearch } from "./BPSearch";
import { OnMismatch, OnPatternFound } from "./types";

// Um CharNode representa caractere
class CharNode {
	nextChar: Record<string, CharNode> = {}; // Próximo caractere
	patterns: string[] = []; // Padrões que terminam neste nó
	longestPattern = 0; // Tamanho do maior padrão neste nó (calculado em resolveNodes)
	nextCharOnFail: CharNode | null = null; // Próximo nó na cadeia de caracteres

	linkChar(char: string) {
		if (this.nextChar[char]) return this.nextChar[char];
		this.nextChar[char] = new CharNode();
		return this.nextChar[char];
	}

	next(char: string): CharNode | undefined {
		return this.nextChar[char];
	}
}

export class SPSearch extends BPSearch<TNullable<OnPatternFound>> {
	private root = new CharNode();
	onMismatch?: OnMismatch;

	private patternToNode(pattern: string) {
		let node = this.root;
		for (const char of pattern) {
			node = node.linkChar(char); // Vincula e entra no próximo nó/caractere
		}
		node.patterns.push(pattern); // Ultimo nó/caractere recebe o padrão
		node.longestPattern = Math.max(node.longestPattern, pattern.length);
	}

	private resolveNodes() {
		if (!this.dirty) return;
		this.dirty = false;

		this.root = new CharNode(); // Reinicia a arvore
		for (const pattern in this.callbacks) {
			this.patternToNode(pattern);
		}

		const queue: CharNode[] = [];
		/* Inicialização dos filhos raiz */
		for (const char in this.root.nextChar) {
			this.root.nextChar[char].nextCharOnFail = this.root;
			queue.push(this.root.nextChar[char]);
		}

		while (queue.length) {
			const node = queue.shift()!;

			for (const char in node.nextChar) {
				const nextNode = node.nextChar[char];
				let failNode = node.nextCharOnFail;

				/* Sobe na cadeia de falha até achar um nó que tenha o caractere ou chegar na raiz */
				while (failNode && !failNode.next(char)) {
					failNode = failNode.nextCharOnFail;
				}

				/* Se achou, o link de falha é o próximo caractere do failNode, senão é a raiz */
				nextNode.nextCharOnFail = failNode
					? failNode.nextChar[char]
					: this.root;

				nextNode.patterns.push(...nextNode.nextCharOnFail.patterns);
				nextNode.longestPattern = Math.max(nextNode.longestPattern, nextNode.nextCharOnFail.longestPattern);
				queue.push(nextNode);
			}
		}
	}

	resolve() {
		this.resolveNodes();

		let mismatchStart = 0;
		let node = this.root;

		for (let charIdx = 0; charIdx < this.content.length; charIdx++) {
			const char = this.content[charIdx];

			/* Sobe na cadeia de falha até achar um nó que tenha o caractere ou chegar na raiz */
			while (node !== this.root && !node.next(char)) {
				node = node.nextCharOnFail!;
			}

			/* Se achou, o link de falha é o próximo caractere do failNode, senão é a raiz */
			node = node.next(char) ?? this.root;

			if (!node.patterns.length) continue;

			const matchStart = charIdx - node.longestPattern + 1;
			if (matchStart > mismatchStart) {
				this.onMismatch?.(
					this.content.slice(mismatchStart, matchStart),
					mismatchStart,
					node.patterns
				);
			}

			/* Dispara os callbacks para os padrões encontrados */
			for (const pattern of node.patterns) {
				const idx = charIdx - pattern.length + 1;
				this.callbacks[pattern]?.(pattern, idx);
			}

			mismatchStart = charIdx + 1;
		}

		if (mismatchStart < this.content.length) {
			this.onMismatch?.(this.content.slice(mismatchStart), mismatchStart, []);
		}
	}
}
