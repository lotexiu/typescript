type OnPatternFound = (pattern: string, index: number) => void;
type PatternCallbacks = Record<string, OnPatternFound>;

// Um CharNode representa caractere
class CharNode {
	nextChar: Record<string, CharNode> = {}; // Próximo caractere
	patterns: string[] = []; // Padrões que terminam neste nó
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

export class SSearch {
	private root = new CharNode();
	private callbacks: PatternCallbacks = {};
	private dirty = false;

	content: string = "";

	addPatterns(patterns: PatternCallbacks) {
		for (const pattern in patterns) {
			if (!(pattern in this.callbacks)) {
				this.dirty = true;
			}
			this.callbacks[pattern] = patterns[pattern];
		}
	}

	removePatterns(patterns: string[]) {
		for (const pattern of patterns) {
			delete this.callbacks[pattern];
		}
		this.dirty = true;
	}

	cleanPatterns() {
		this.callbacks = {};
		this.dirty = true;
	}

	private patternToNode(pattern: string) {
		let node = this.root;
		for (const char of pattern) {
			node = node.linkChar(char); // Vincula e entra no próximo nó/caractere
		}
		node.patterns.push(pattern); // Ultimo nó/caractere recebe o padrão
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
				queue.push(nextNode);
			}
		}
	}

	resolve() {
		this.resolveNodes();

		let node = this.root;
		for (let charIdx = 0; charIdx < this.content.length; charIdx++) {
			const char = this.content[charIdx];

			/* Sobe na cadeia de falha até achar um nó que tenha o caractere ou chegar na raiz */
			while (node !== this.root && !node.next(char)) {
				node = node.nextCharOnFail!;
			}

			/* Se achou, o link de falha é o próximo caractere do failNode, senão é a raiz */
			node = node.next(char) ?? this.root;

			/* Dispara os callbacks para os padrões encontrados */
			for (const pattern of node.patterns) {
				const idx = charIdx - pattern.length + 1;
				this.callbacks[pattern](pattern, idx);
			}
		}
	}
}
