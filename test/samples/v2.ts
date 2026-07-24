class Gate {
	static readonly regexKeys = /[.*+?^${}()|[\]\\]/g
	static readonly applyEscape = '\\$&'

	public symetric: boolean

	constructor(
		public open: string,
		public close: string,
		public opace: boolean = false,
	) {
		this.symetric = this.open == this.close
	}

	get escapedGateKeys() {
		const keys = [this.open.replace(Gate.regexKeys, Gate.applyEscape)]
		if (this.symetric) return keys
		keys.push(this.close.replace(Gate.regexKeys, Gate.applyEscape))
		return keys
	}
}

class LexerNode {
	constructor(
		public parent: LexerNode | null,
		public lexer: Lexer, 
		public gate: Gate,
		public start: number,
		public end: number,
	) {
		if (!parent) return;
		parent.childrens.push(this)
	}

	childrens: LexerNode[] = []

	get text() { return this.lexer.text.slice(this.start, this.end) }
}

class Lexer {
	readonly pattern: RegExp;
	readonly gatesMap = new Map<string,Gate>()

	constructor(
		public text: string = '',
		public escape: string = '',
		public gates: Gate[] = [],
	){
		this.pattern = new RegExp(
			this.gates
			.flatMap(g => g.escapedGateKeys)
			.sort((a, b) => b.length - a.length)
			.join('|'),
			'g'
		)
		this.gates.forEach(gate => { this.gatesMap.set(gate.open, gate) })
	}
	
	nodes: LexerNode[] = []

	isEscape(index: number){
		let count = 0
		let i = index - 1
		while (i >= 0 && this.text[i] === this.escape) { count++; i-- }
		return count % 2 !== 0
	}

	resolve() {
		this.nodes = []
		let scope: LexerNode | null = null;
		let match: RegExpExecArray | null
		while ((match = this.pattern.exec(this.text)) !== null) {
			if (this.isEscape(match.index)) continue
			

			/* Close Scope Found */
			if (scope) {
				const key = match[0]
				if (scope.gate.close === key) {
					scope.end = match.index + key.length
					scope = scope.parent
					continue
				}
				if (scope.gate.opace) continue
			}

			/* new Scope Found */
			const key = match[0]
			if (this.gatesMap.has(key)) {
				scope = new LexerNode(scope, this, this.gatesMap.get(key)!, match.index, -1)
				this.nodes.push(scope)
			}
		}
	}
}

export {
	Gate,
	Lexer,
	LexerNode,
}