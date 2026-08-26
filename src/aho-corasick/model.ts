import { TPattern, TAhoCorasickMatch, TAhoCorasickScanHooks } from "./types";

/** Range coberto pela tabela flat (ASCII) — igual ao fast-path do `Parser` (`Uint8Array[128]`); code >=128 sempre volta pra raiz. */
const ALPHABET_SIZE = 128

type TTrieNode = {
	readonly children: Map<number, TTrieNode>
	readonly id: number
	fail: number
	readonly output: number[]
}

class AhoCorasick {
	private constructor(
		private readonly goto: Int32Array,
		private readonly output: ReadonlyArray<readonly number[]>,
		/** Indexado por `patternId` (0..n-1, atribuído por quem chama `compile`) — array, não `Map`, pra lookup O(1) sem hashing no hot path de `scan()`. */
		private readonly patternLengths: Int32Array,
	) {}

	/**
	 * Compila `patterns` num DFA totalmente materializado — goto function completa (`Int32Array`,
	 * `estado * 128 + code`), sem fail-chasing em `scan()`. Baseline por code unit (ASCII); astral
	 * chars e code points >=128 ficam pra uma extensão futura, se necessário.
	 */
	static compile(patterns: TPattern[]): AhoCorasick {
		const root: TTrieNode = { children: new Map(), id: 0, fail: 0, output: [] }
		const nodes: TTrieNode[] = [root]
		const maxPatternId = patterns.reduce((max, pattern) => Math.max(max, pattern.id), -1)
		const patternLengths = new Int32Array(maxPatternId + 1)

		for (const pattern of patterns) {
			let node = root
			for (let i = 0; i < pattern.value.length; i++) {
				const code = pattern.value.charCodeAt(i)
				let child = node.children.get(code)
				if (!child) {
					child = { children: new Map(), id: nodes.length, fail: 0, output: [] }
					nodes.push(child)
					node.children.set(code, child)
				}
				node = child
			}
			node.output.push(pattern.id)
			patternLengths[pattern.id] = pattern.value.length
		}

		// BFS: failure links dos filhos da raiz apontam direto pra raiz; os demais sobem a cadeia de fail do pai.
		const queue: TTrieNode[] = [...root.children.values()]
		for (const child of queue) child.fail = root.id

		let queueIndex = 0
		while (queueIndex < queue.length) {
			const node = queue[queueIndex++]
			for (const [code, child] of node.children) {
				let fail = nodes[node.fail]
				while (fail !== root && !fail.children.has(code)) fail = nodes[fail.fail]
				const failChild = fail.children.get(code)
				child.fail = failChild ? failChild.id : root.id
				if (nodes[child.fail].output.length) child.output.push(...nodes[child.fail].output)
				queue.push(child)
			}
		}

		// Materializa a goto function inteira — em ordem BFS, goto[node.fail] já está resolvido quando node é processado.
		const goto = new Int32Array(nodes.length * ALPHABET_SIZE)
		const output: number[][] = nodes.map((node) => node.output)

		for (const node of [root, ...queue]) {
			const base = node.id * ALPHABET_SIZE
			for (let code = 0; code < ALPHABET_SIZE; code++) {
				const child = node.children.get(code)
				goto[base + code] = child ? child.id
					: node === root ? root.id
					: goto[node.fail * ALPHABET_SIZE + code]
			}
		}

		return new AhoCorasick(goto, output, patternLengths)
	}

	/**
	 * Percorre `text` uma única vez (opcionalmente restrito a `[start, end)`, sem slice — pra quem
	 * já tem sub-regiões conhecidas, ex: os gaps do `Parser`), reportando candidatos via
	 * `hooks.onMatch` e retornando os aceitos. Dono exclusivo do traversal — consumidores (Parser,
	 * Lexer) não fazem seu próprio loop sobre `text`.
	 *
	 * `hooks.onPosition` roda antes da tentativa de match em cada posição — retornar um número
	 * pula essa quantidade de chars e reseta o autômato pra raiz (ex: escape de char).
	 * `hooks.onMatch` roda por candidato encontrado — retornar `false` rejeita (ex: close do gate
	 * errado, dentro de escopo opaco); qualquer outro retorno aceita e o match entra no array final.
	 */
	scan(text: string, hooks: TAhoCorasickScanHooks = {}, start: number = 0, end: number = text.length): TAhoCorasickMatch[] {
		const { onPosition, onMatch } = hooks
		const { goto, output, patternLengths } = this
		const matches: TAhoCorasickMatch[] = []
		let state = 0

		let i = start
		while (i < end) {
			const code = text.charCodeAt(i)

			if (onPosition) {
				const skip = onPosition(i, code)
				if (skip) { i += skip; state = 0; continue }
			}

			state = code < ALPHABET_SIZE ? goto[state * ALPHABET_SIZE + code] : 0

			const patternIds = output[state]
			if (patternIds.length) {
				const matchEnd = i + 1
				for (const patternId of patternIds) {
					const matchStart = matchEnd - patternLengths[patternId]
					if (onMatch && onMatch(patternId, matchStart, matchEnd) === false) continue
					matches.push({ patternId, start: matchStart, end: matchEnd })
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
