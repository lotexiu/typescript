import { Model } from "@ts/model/model";
import { Computed, computed } from "@ts/computed/model";
import { ParserGate, ParserGap, ParserNode, ParserRoot } from "./node/model";

class Parser {
	public readonly text = new Model<string>('')

	private readonly configVersion = new Model(0)
	private readonly _root: Computed<ParserRoot> = computed(
		() => this.resolve(),
		[this.text, this.configVersion],
	)

	get root(): ParserRoot { return this._root.value }

	private escapeCode: number = NaN
	private _escape: string = ''
	get escape() { return this._escape }
	set escape(value: string) {
		this._escape = value
		this.escapeCode = value.charCodeAt(0)
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

	private isGate!: Uint8Array;
	private gatesMap!: (ParserGate | null)[];
	private multiCharGates!: ParserGate[];

	private bumpConfig() {
		this.configVersion.set(this.configVersion.value + 1)
	}

	clearGates() {
		this.isGate = new Uint8Array(128)
		this.gatesMap = new Array(128).fill(null)
		this.multiCharGates = []
		this.bumpConfig();
	}

	addGates(...gates: ParserGate[]) {
		for (const gate of gates) {
			const openCode = gate.open.charCodeAt(0)

			if (gate.open.length === 1) {
				this.isGate[openCode] = 1
				this.gatesMap[openCode] = gate

				if (!gate.symetric) {
					// Close diferente do open: marca o close também no isGate
					const closeCode = gate.close.charCodeAt(0)
					this.isGate[closeCode] = 1
				}
			} else {
				// Gate de 2+ chars (ex: /* */): guarda separado
				// Marca o primeiro char no isGate para o early-check
				this.isGate[openCode] = 1
				const closeCode = gate.close.charCodeAt(0)
				this.isGate[closeCode] = 1
				this.multiCharGates.push(gate)
			}
		}
		this.bumpConfig();
	}

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
		const { isGate, gatesMap, multiCharGates, escapeCode } = this
		const text = this.text.value
		const len = text.length
		const root = new ParserRoot(text)
		let scope: ParserNode | ParserRoot = root;

		for (let i = 0; i < len; i++) {
			const code = text.charCodeAt(i)

			// Early exit: ~94% dos chars saem aqui — 2 operações, sem alocação
			if (code > 127 || isGate[code] === 0) continue

			// Escape: pula o char seguinte se número ímpar de backslashes
			if (code === escapeCode) { i++; continue }

			// Verifica se é escape contável (ex: \\' — o ' não está escaped)
			if (this.isEscaped(text, i)) continue

			// Tenta gates de 2+ chars primeiro (mais específicos)
			let matchedMulti = false
			for (const gate of multiCharGates) {
				// Verifica o open
				if (text.startsWith(gate.open, i)) {
					if (scope instanceof ParserNode && scope.gate.opaque) { matchedMulti = true; break }
					this.flushGap(scope, root, i)
					scope = new ParserNode(scope, root, gate, i)
					root.nodes.push(scope)
					i += gate.open.length - 1
					matchedMulti = true
					break
				}
				// Verifica o close — só do gate que abriu o escopo atual, não de qualquer gate registrado
				if (scope instanceof ParserNode && scope.gate === gate && text.startsWith(gate.close, i)) {
					this.closeScope(scope, root, i, false)
					scope = scope.parent
					i += gate.close.length - 1
					matchedMulti = true
					break
				}
			}
			if (matchedMulti) continue

			// Gate de 1 char
			const key = text[i]

			// Fecha escopo atual
			if (scope instanceof ParserNode) {
				if (scope.gate.close === key) {
					this.closeScope(scope, root, i, false)
					scope = scope.parent
					continue
				}
				// Escopo opaco: ignora tudo dentro
				if (scope.gate.opaque) continue
			}

			// Abre novo escopo
			const gate = gatesMap[code]
			if (gate !== null) {
				this.flushGap(scope, root, i)
				scope = new ParserNode(scope, root, gate, i)
				root.nodes.push(scope)
			}
		}

		// EOF com escopos ainda abertos: fecha em cascata como unclosed
		let cursor: ParserNode | ParserRoot = scope
		while (cursor instanceof ParserNode) {
			const parent = cursor.parent
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
