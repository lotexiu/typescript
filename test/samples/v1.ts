import { BADNAME } from "dns";

type Gates = Record<string, string> & {
	sizes: number[]
	maxSize: number
	raw: Set<string>
}

type Setting = {
	escape: string
	gates: Gates
}

const reservedRegexKeys = /[.*+?^${}()|[\]\\]/g;

/**
 * `raw` gates (ex.: aspas, `/* *​/`) são opacos: uma vez dentro deles, nenhum
 * outro gate pode ser aberto — só o fechamento do próprio gate é reconhecido.
 * Sem isso, um `(`/`{` dentro de uma string vira um node aninhado, e o
 * fechamento real da string acaba sendo lido como abertura de outra string.
 */
function declareGates(open: string, close: string, raw?: boolean) {
	const gates: Gates = { sizes: [], maxSize: 0, raw: new Set() } as any
	function newGate(open: string, close: string, raw?: boolean) {
		gates[open] = close
		if (raw) gates.raw.add(open)
		if (!gates.sizes.includes(open.length)) {
			gates.sizes.push(open.length)
			if (open.length > gates.maxSize) gates.maxSize = open.length
		}
		return newGate
	}
	newGate.end = gates
	return newGate(open, close, raw)
}

class LexerNode {
	constructor(
		public start: number,
		public gate: [string, string],
		public parent: LexerNode | Lexer,
		public project: Lexer
	) {
		(project as any)._nodeCount++;
		if (parent == project) return
		(parent as any)._childrens.push(this);
	}

	private _childrens: LexerNode[] = []
	get childrens() { return this._childrens }
	public end: number = -1

	get text() {
		return this.project.text.slice(this.start, this.end)
	}
}

class Lexer {
	private _nodes: LexerNode[] = []
	get nodes() { 
		if (this._nodes.length == 0) this.resolve()
		return this._nodes
	}

	constructor(
		readonly text: string,
		readonly setting: Setting
	){
		this.text = text
	}

	static isEscaped(text: string, index: number, escape: string): boolean {
		let count = 0
		let i = index - 1
		while (i >= 0 && text[i] === escape) { count++; i-- }
		return count % 2 !== 0
	}

	resolve() {
		const { gates, escape } = this.setting
		const pattern = new RegExp(
			Object.entries(gates)
				.filter(([k]) => k !== 'sizes' && k !== 'maxSize' && k !== 'raw')
				.flatMap(([a, b]) => {
					const ea = a.replace(reservedRegexKeys, '\\$&')
					const eb = (b as string).replace(reservedRegexKeys, '\\$&')
					return a === b ? [ea] : [ea, eb]  // evita duplicar 'x'|'x' nos simétricos
				})
				.sort((a, b) => b.length - a.length)
				.join('|'),
			'g'
		)
		const results: LexerNode[] = []
		let scope: any = this
		let m: RegExpExecArray | null

		while ((m = pattern.exec(this.text)) !== null) {
			if (Lexer.isEscaped(this.text, m.index, escape)) continue

			const key = m[0]

			if (scope !== this) {
				if (scope.gate[1] === key) {
					scope.end = m.index + key.length
					scope = scope.parent
					continue
				}
				if (gates.raw.has(scope.gate[0])) continue
			}

			if (key in gates) {
				scope = new LexerNode(m.index, [key, gates[key]], scope, this)
				results.push(scope)
			}
		}

		this._nodes = results
	}
}

export {
	declareGates,
	Lexer,
	LexerNode
}