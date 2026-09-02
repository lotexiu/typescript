import { Model } from "@ts/model/model";
import { Computed, computed } from "@ts/computed/model";
import { AhoCorasick } from "@ts/aho-corasick/model";
import { ParserGate, ParserGap, ParserNode, ParserRoot } from "./node/model";

type TGatePatternInfo = {
	gate: ParserGate
	side: 'open' | 'close' | 'symmetric'
}

class Parser {
	public readonly text = new Model<string>('')

	private readonly configVersion = new Model(0)
	private readonly _root: Computed<ParserRoot> = computed(
		() => this.resolve(),
		[this.text, this.configVersion],
	)

	get root(): ParserRoot { return this._root.value }

	private _escape: string = ''
	get escape() { return this._escape }
	set escape(value: string) {
		this._escape = value
		this.bumpConfig();
	}

	/**
	 * Opt-in: rastrear os gaps (texto fora de qualquer node) custa ~50% a mais no resolve(),
	 * porque em código real a maior parte do texto fica fora de gates — não é uma feature marginal.
	 * Desligado por padrão; quem precisa de gaps liga explicitamente.
	 */
	private _trackGaps: boolean = false
	get trackGaps() { return this._trackGaps }
	set trackGaps(value: boolean) {
		if (value === this._trackGaps) return
		this._trackGaps = value
		this.bumpConfig();
	}

	constructor() {
		this.clearGates();
	}

	private gates: ParserGate[] = []
	private ahoCorasick!: AhoCorasick;
	private patternInfo!: TGatePatternInfo[];

	private bumpConfig() {
		this.configVersion.set(this.configVersion.value + 1)
	}

	/** Recompila o autômato a partir de `gates` inteiro — só roda em config-time (addGates/clearGates), nunca por mudança de texto. */
	private compileGates() {
		const patterns: string[] = []
		const patternInfo: TGatePatternInfo[] = []

		for (const gate of this.gates) {
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

		this.patternInfo = patternInfo
		this.ahoCorasick = AhoCorasick.compile(...patterns)
	}

	clearGates() {
		this.gates = []
		this.compileGates();
		this.bumpConfig();
	}

	addGates(...gates: ParserGate[]) {
		this.gates.push(...gates)
		this.compileGates();
		this.bumpConfig();
	}

	/** Conta backslashes imediatamente antes de `index` — ímpar = escaped. No-op se `escape` não foi configurado (`text[i] === ''` nunca bate). */
	private isEscaped(text: string, index: number): boolean {
		let count = 0
		let i = index - 1
		while (i >= 0 && text[i] === this.escape) { count++; i-- }
		return count % 2 !== 0
	}

	/** Fecha `scope` em `at` (posição do gate de fechamento, ou EOF) e registra o gap final dele. */
	private closeScope(scope: ParserNode, root: ParserRoot, at: number, unclosed: boolean) {
		this.flushGap(scope, root, at)
		scope.close(at, unclosed)
	}

	/** Registra o gap entre o fim do último filho de `scope` (ou seu início de conteúdo) e `upTo`. */
	private flushGap(scope: ParserNode | ParserRoot, root: ParserRoot, upTo: number) {
		if (!this._trackGaps) return
		const lastChild = scope.children[scope.children.length - 1]
		const from = lastChild ? lastChild.end : (scope instanceof ParserNode ? scope.contentStart : 0)
		if (upTo <= from) return
		const gap = new ParserGap(scope, root, from, upTo)
		scope.gaps.push(gap)
		root.allGaps.push(gap)
	}

	private resolve(): ParserRoot {
		const text = this.text.value
		const len = text.length
		const root = new ParserRoot(text)
		let scope: ParserNode | ParserRoot = root;
		const { patternInfo } = this

		this.ahoCorasick.scan(text, {
			onMatch: (patternId, matchStart) => {
				if (this.isEscaped(text, matchStart)) return false

				const { gate, side } = patternInfo[patternId]

				// Fecha `scope` se `match` for o close (ou o símbolo simétrico) do gate que a abriu — checado antes do opaque.
				if (scope instanceof ParserNode && side !== 'open' && scope.gate === gate) {
					this.closeScope(scope, root, matchStart, false)
					scope = scope.parent
					return false
				}

				// Escopo opaco: ignora qualquer outra coisa (open de outro gate, close de gate errado).
				if (scope instanceof ParserNode && scope.gate.opaque) return false

				// Abre novo escopo (open normal ou o próprio símbolo de um gate simétrico ainda não aberto).
				if (side !== 'close') {
					this.flushGap(scope, root, matchStart)
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
			this.closeScope(cursor, root, len, true)
			cursor = parent
		}
		this.flushGap(root, root, len)

		return root;
	}
}

export {
	Parser,
}
