import { TPattern, TAhoCorasickMatch, TAhoCorasickScanHooks } from "./types";

/** Nó da trie. `fail` aponta pra si mesmo na raiz (self-loop), permitindo `while (node !== root)` sem checar null. */
class AhoCorasickNode {
	readonly children = new Map<number, AhoCorasickNode>()
	fail: AhoCorasickNode
	readonly output: number[] = []

	constructor(fail?: AhoCorasickNode) {
		this.fail = fail ?? this
	}
}

class AhoCorasick {
	private constructor(
		private readonly root: AhoCorasickNode,
		private readonly patternLengths: ReadonlyMap<number, number>,
	) {}

	/**
	 * Compila `patterns` numa trie com failure links (Aho-Corasick clássico) pronta pra `scan()`.
	 * Baseline por code unit (UTF-16) — igual à estratégia rápida de `Parser`/`Mask`; suporte a
	 * astral chars fica pra uma otimização futura, se o benchmark apontar necessidade.
	 */
	static compile(patterns: TPattern[]): AhoCorasick {
		const root = new AhoCorasickNode()
		const patternLengths = new Map<number, number>()

		for (const pattern of patterns) {
			let node = root
			for (let i = 0; i < pattern.value.length; i++) {
				const code = pattern.value.charCodeAt(i)
				let child = node.children.get(code)
				if (!child) {
					child = new AhoCorasickNode(root)
					node.children.set(code, child)
				}
				node = child
			}
			node.output.push(pattern.id)
			patternLengths.set(pattern.id, pattern.value.length)
		}

		// BFS: failure links dos filhos da raiz apontam direto pra raiz; os demais sobem a cadeia de fail do pai.
		const queue: AhoCorasickNode[] = [...root.children.values()]
		for (const child of queue) child.fail = root

		let queueIndex = 0
		while (queueIndex < queue.length) {
			const node = queue[queueIndex++]
			for (const [code, child] of node.children) {
				let fail = node.fail
				while (fail !== root && !fail.children.has(code)) fail = fail.fail
				child.fail = fail.children.get(code) ?? root
				if (child.fail.output.length) child.output.push(...child.fail.output)
				queue.push(child)
			}
		}

		return new AhoCorasick(root, patternLengths)
	}

	/**
	 * Percorre `text` uma única vez, reportando candidatos via `hooks.onMatch` e retornando os
	 * aceitos. Dono exclusivo do traversal — consumidores (Parser, Lexer) não fazem seu próprio
	 * loop sobre `text`.
	 *
	 * `hooks.onPosition` roda antes da tentativa de match em cada posição — retornar um número
	 * pula essa quantidade de chars e reseta o autômato pra raiz (ex: escape de char).
	 * `hooks.onMatch` roda por candidato encontrado — retornar `false` rejeita (ex: close do gate
	 * errado, dentro de escopo opaco); qualquer outro retorno aceita e o match entra no array final.
	 */
	scan(text: string, hooks: TAhoCorasickScanHooks = {}): TAhoCorasickMatch[] {
		const { onPosition, onMatch } = hooks
		const { root, patternLengths } = this
		const matches: TAhoCorasickMatch[] = []
		const len = text.length
		let node = root

		let i = 0
		while (i < len) {
			const code = text.charCodeAt(i)

			if (onPosition) {
				const skip = onPosition(i, code)
				if (skip) { i += skip; node = root; continue }
			}

			while (node !== root && !node.children.has(code)) node = node.fail
			node = node.children.get(code) ?? root

			if (node.output.length) {
				const end = i + 1
				for (const patternId of node.output) {
					const match: TAhoCorasickMatch = { patternId, start: end - patternLengths.get(patternId)!, end }
					if (onMatch && onMatch(match) === false) continue
					matches.push(match)
				}
			}

			i++
		}

		return matches
	}
}

export {
	AhoCorasick,
}
