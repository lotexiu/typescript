import { AhoCorasick } from "@ts/aho-corasick/model";
import { computed } from "@tsr-node/computed/model";
import { signal } from "@tsr-node/signal/model";
import { ParserGap, ParserGate, ParserNode, ParserRoot } from "./node/model";
import { TGatePatternInfo } from "./types";

/**
 * Parser de escopos: reconhece só delimitadores (`ParserGate`) e monta a árvore de escopos de um texto, sem entender a linguagem.
 * O texto é um signal e a árvore (`root`) é recalculada sob demanda quando ele ou os gates mudam.
 * @example
 * const parser = new Parser()
 * parser.addGates(new ParserGate('(', ')'), new ParserGate('"', '"', true))
 * parser.text.set('f(a, "b)")')
 * parser.root.children[0].content // 'a, "b)"'
 */
class Parser {
	/** Texto a parsear. */
	public readonly text = signal('')

	readonly #configVersion = signal(0)
	// `resolve()` lê `text`; a config (gates, escape, trackGaps) não é um signal, então a versão
	// é lida aqui para que mudar a config também refaça a árvore.
	readonly #root = computed(() => {
		this.#configVersion()
		return this.#resolve()
	})

	/** Árvore de escopos do texto atual (reativa). */
	get root(): ParserRoot { return this.#root() }

	#escape: string = ''
	/** Caractere de escape: um delimitador precedido por ele um número ímpar de vezes não conta. */
	get escape() { return this.#escape }
	/** Troca o caractere de escape; a árvore é recalculada na próxima leitura. */
	set escape(value: string) {
		this.#escape = value
		this.#bumpConfig();
	}

	/**
	 * Opt-in: rastrear os gaps (texto fora de qualquer node) custa ~50% a mais no resolve(),
	 * porque em código real a maior parte do texto fica fora de gates — não é uma feature marginal.
	 * Desligado por padrão; quem precisa de gaps liga explicitamente.
	 */
	#trackGaps: boolean = false
	/** Guarda também os trechos entre os escopos (`gaps`) de cada nó. */
	get trackGaps() { return this.#trackGaps }
	/** Liga ou desliga a coleta de `gaps`. */
	set trackGaps(value: boolean) {
		if (value === this.#trackGaps) return
		this.#trackGaps = value
		this.#bumpConfig();
	}

	constructor() {
		this.clearGates();
	}

	#gates: ParserGate[] = []
	#ahoCorasick!: AhoCorasick;
	#patternInfo!: TGatePatternInfo[];
	/** Gates que só abrem de dentro do pai opaco (ver `ParserGate.holeGate`) — nunca pelo caminho normal. */
	#holeGates = new Set<ParserGate>();

	#bumpConfig() {
		this.#configVersion.update((version) => version + 1)
	}

	/** Recompila o autômato a partir de `gates` inteiro — só roda em config-time (addGates/clearGates), nunca por mudança de texto. */
	#compileGates() {
		const patterns: string[] = []
		const patternInfo: TGatePatternInfo[] = []
		this.#holeGates = new Set()

		const emit = (gate: ParserGate) => {
			if (gate.symetric) {
				patternInfo.push({ gate, side: 'symmetric' })
				patterns.push(gate.open)
			} else {
				patternInfo.push({ gate, side: 'open' })
				patterns.push(gate.open)
				patternInfo.push({ gate, side: 'close' })
				patterns.push(gate.close)
			}
		}

		for (const gate of this.#gates) {
			emit(gate)
			if (gate.holeGate) {
				this.#holeGates.add(gate.holeGate)
				emit(gate.holeGate)
			}
		}

		this.#patternInfo = patternInfo
		this.#ahoCorasick = AhoCorasick.compile(...patterns)
	}

	/** Remove todos os gates. */
	clearGates() {
		this.#gates = []
		this.#compileGates();
		this.#bumpConfig();
	}

	/** Adiciona gates; a árvore é recalculada na próxima leitura. */
	addGates(...gates: ParserGate[]) {
		this.#gates.push(...gates)
		this.#compileGates();
		this.#bumpConfig();
	}

	/** Conta backslashes imediatamente antes de `index` — ímpar = escaped. No-op se `escape` não foi configurado (`text[i] === ''` nunca bate). */
	#isEscaped(text: string, index: number): boolean {
		let count = 0
		let position = index - 1
		while (position >= 0 && text[position] === this.escape) { count++; position-- }
		return count % 2 !== 0
	}

	/** Fecha `scope` em `at` (posição do gate de fechamento, ou EOF) e registra o gap final dele. */
	#closeScope(scope: ParserNode, root: ParserRoot, at: number, unclosed: boolean) {
		this.#flushGap(scope, root, at)
		scope.close(at, unclosed)
	}

	/** Registra o gap entre o fim do último filho de `scope` (ou seu início de conteúdo) e `upTo`. */
	#flushGap(scope: ParserNode | ParserRoot, root: ParserRoot, upTo: number) {
		if (!this.#trackGaps) return
		const lastChild = scope.children[scope.children.length - 1]
		const from = lastChild ? lastChild.end : (scope instanceof ParserNode ? scope.contentStart : 0)
		if (upTo <= from) return
		const gap = new ParserGap(scope, root, from, upTo)
		scope.gaps.push(gap)
		root.allGaps.push(gap)
	}

	#resolve(): ParserRoot {
		const text = this.text()
		const len = text.length
		const root = new ParserRoot(text)
		let scope: ParserNode | ParserRoot = root;
		const patternInfo = this.#patternInfo
		let consumedUntil = 0

		this.#ahoCorasick.scan(text, {
			onMatch: (patternId, matchStart) => {
				if (matchStart < consumedUntil) return false
				if (this.#isEscaped(text, matchStart)) return false

				const { gate, side } = patternInfo[patternId]
				const consume = () => {
					consumedUntil = matchStart + (side === 'close' ? gate.close.length : gate.open.length)
				}

				// Fecha `scope` se `match` for o close (ou o símbolo simétrico) do gate que a abriu — checado antes do opaque.
				if (scope instanceof ParserNode && side !== 'open' && scope.gate === gate) {
					consume()
					this.#closeScope(scope, root, matchStart, false)
					scope = scope.parent
					return false
				}

				// Escopo opaco: ignora tudo lá dentro — exceto o `open` do `holeGate` do próprio
				// gate, que reabre um escopo transparente (o `${ … }` de uma template string).
				if (scope instanceof ParserNode && scope.gate.opaque) {
					if (side !== 'close' && gate === scope.gate.holeGate) {
						consume()
						this.#flushGap(scope, root, matchStart)
						scope = new ParserNode(scope, root, gate, matchStart)
						root.nodes.push(scope)
					}
					return false
				}

				// `holeGate` nunca abre pelo caminho normal — só de dentro do pai opaco, acima.
				if (this.#holeGates.has(gate)) return false

				// Abre novo escopo (open normal ou o próprio símbolo de um gate simétrico ainda não aberto).
				if (side !== 'close') {
					consume()
					this.#flushGap(scope, root, matchStart)
					scope = new ParserNode(scope, root, gate, matchStart)
					root.nodes.push(scope)
				}

				return false
			},
		})

		// EOF com escopos ainda abertos: fecha em cascata como unclosed
		let cursor: ParserNode | ParserRoot = scope
		while (cursor instanceof ParserNode) {
			const parent: ParserNode | ParserRoot = cursor.parent
			this.#closeScope(cursor, root, len, true)
			cursor = parent
		}
		this.#flushGap(root, root, len)

		return root;
	}
}

export {
	Parser,
}
