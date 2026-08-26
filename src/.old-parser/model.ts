class ParserGate {
	public readonly symetric: boolean

	constructor(
		public readonly open: string,
		public readonly close: string,
		public readonly opaque: boolean = false,
	) {
		this.symetric = open === close
	}
}

class ParserNode {
	public end: number
	public childrens: ParserNode[] = []

	constructor(
		public readonly parent: ParserNode | ParserRoot,
		public readonly lexer: Parser,
		public readonly gate: ParserGate,
		public readonly start: number,
	) {
		this.end = -1
		if (parent) parent.childrens.push(this)
	}
}

class ParserRoot {
	constructor(
		readonly childrens: ParserNode[] = [],
		readonly nodes: ParserNode[] = [],
	) {}
}

class Parser {
	private _root?: ParserRoot;
	private _changed: boolean = false
	private _processed: boolean = false
	
	get root() { return this._root }
	get changed() {return this._changed}
	get processed() {return this._processed}

	private escapeCode: number = NaN
	private _escape: string = ''
	get escape() { return this._escape }
	set escape(value: string) {
		this._escape = value
		this.escapeCode = value.charCodeAt(0)
		this._changed = true;
	}

	private _text: string = ''
	get text() { return this._text }
	set text(value: string) {
		this._text = value
		this._changed = true;
	}

	constructor() {
		this.clearGates();
	}

	private isGate!: Uint8Array;
	private gatesMap!: ParserGate[];
	private multiCharGates!: ParserGate[];

	clearGates() {
		this._changed = true;
		this.isGate = new Uint8Array(128)
		this.gatesMap = new Array(128).fill(null)
		this.multiCharGates = []
	}

	addGates(...gates: ParserGate[]) {
		this._changed = true;
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
	}

	private isEscaped(index: number): boolean {
		let count = 0
		let i = index - 1
		while (i >= 0 && this.text[i] === this.escape) { count++; i-- }
		return count % 2 !== 0
	}

	resolve() {
		if (!this.changed && this.processed) return;

		const {text, isGate, gatesMap, multiCharGates, escapeCode} = this
		const len = text.length
		this._root = new ParserRoot()
		let scope: ParserNode | ParserRoot = this._root;

		for (let i = 0; i < len; i++) {
			const code = text.charCodeAt(i)

			// Early exit: ~94% dos chars saem aqui — 2 operações, sem alocação
			if (code > 127 || isGate[code] === 0) continue

			// Escape: pula o char seguinte se número ímpar de backslashes
			if (code === escapeCode) { i++; continue }

			// Verifica se é escape contável (ex: \\' — o ' não está escaped)
			if (this.isEscaped(i)) continue

			// Tenta gates de 2+ chars primeiro (mais específicos)
			let matchedMulti = false
			for (const gate of multiCharGates) {
				// Verifica o open
				if (text.startsWith(gate.open, i)) {
					if (scope instanceof ParserNode && scope.gate.opaque) { matchedMulti = true; break }
					scope = new ParserNode(scope, this, gate, i)
					this._root.nodes.push(scope as ParserNode)
					i += gate.open.length - 1
					matchedMulti = true
					break
				}
				// Verifica o close
				if (scope instanceof ParserNode && text.startsWith(gate.close, i)) {
					scope.end = i + gate.close.length
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
					scope.end = i + 1
					scope = scope.parent
					continue
				}
				// Escopo opaco: ignora tudo dentro
				if (scope.gate.opaque) continue
			}

			// Abre novo escopo
			const gate = gatesMap[code]
			if (gate !== null) {
				scope = new ParserNode(scope, this, gate, i)
				this._root.nodes.push(scope as ParserNode)
			}
		}
		
		this._changed = false;
		this._processed = true;
	}
}

export {
	Parser,
	ParserNode,
	ParserGate,
}