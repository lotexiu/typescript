type OnPatternFound = (pattern: string, index: number) => void;
type PatternCallbacks = Record<string, OnPatternFound>;

// Um CharNode representa caractere
class CharNode {
	nextChar: Record<string, CharNode> = {}; // Próximo caractere
	patterns: string[] = []; // Padrões que terminam neste nó
	nextCharOnFail: CharNode | null = null; // Próximo nó na cadeia de caracteres

	next(char: string): boolean {
		return !!this.nextChar[char];
	}
}

class SSearch {
	private root = new CharNode();

	callbacks: PatternCallbacks = {};
	content: string = '';

	linkChar(char: string, node: CharNode) {
		if (node.next(char)) return;
		node.nextChar[char] = new CharNode();
		if (node == this.root) {
			node.nextChar[char].nextCharOnFail = this.root; // O próximo nó do root é o próprio root
		}
	}

	patternToNode(pattern: string) {
		let node = this.root;
		for (const char of pattern) {
			this.linkChar(char, node); // Vincula o próximo nó/caractere
			node = node.nextChar[char]; // Entra no proximo nó/caractere
		}
		node.patterns.push(pattern); // Ultimo nó/caractere recebe o padrão
	}

	resolveNodes() {
		this.root = new CharNode();
		for (const pattern in this.callbacks) {
			this.patternToNode(pattern);

		}
	}

	resolve() {
		this.resolveNodes();

		let node = this.root;
	}
}


/* type OnPatternFound = (pattern: string, index: number) => void;

class AhoNode {
  children: Record<string, AhoNode> = {};
  failure: AhoNode | null = null;
  patterns: string[] = []; // Padrões que terminam neste nó
}

export class FastPatternFinder {
  private root = new AhoNode();
  private callbacks: Record<string, OnPatternFound> = {};
  content: string = '';

  addPattern(pattern: string, callback: OnPatternFound) {
    let node = this.root;
    for (const char of pattern) {
      if (!node.children[char]) node.children[char] = new AhoNode();
      node = node.children[char];
    }
    node.patterns.push(pattern);
    this.callbacks[pattern] = callback;
  }

  build() {
    const queue: AhoNode[] = [];
    // Inicializa os filhos da raiz
    for (const char in this.root.children) {
      const child = this.root.children[char];
      child.failure = this.root;
      queue.push(child);
    }

    // Constrói os links de falha (BFS)
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const char in current.children) {
        const child = current.children[char];
        let f = current.failure;
        while (f && !f.children[char]) f = f.failure;
        child.failure = f ? f.children[char] : this.root;
        // Combina padrões encontrados em nós de falha (para padrões dentro de padrões)
        child.patterns = [...child.patterns, ...child.failure!.patterns];
        queue.push(child);
      }
    }
  }

  resolve() {
    let node = this.root;
    for (let i = 0; i < this.content.length; i++) {
      const char = this.content[i];
      while (node !== this.root && !node.children[char]) {
        node = node.failure!;
      }
      node = node.children[char] || this.root;

      for (const pattern of node.patterns) {
        // i - pattern.length + 1 dá o índice inicial real
        this.callbacks[pattern](pattern, i - pattern.length + 1);
      }
    }
  }
}
 */
