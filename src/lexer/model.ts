import { Model } from "@ts/model/model";
import { Computed, computed } from "@ts/computed/model";
import { Parser } from "@ts/parser/model";
import { ParserGate } from "@ts/parser/node/model";
import { AhoCorasick } from "@ts/aho-corasick/model";
import { TToken, TTokenCharClassRule, TTokenDelimitedRule, TTokenLiteralRule, TTokenRule } from "./types";
import { LEXER_BASIC_RULES } from "./declarations";

/** `value` só faz o slice no 1º acesso — sem closure por token (custava mais que o resto do scan inteiro, ver benchmark). */
class Token implements TToken {
	private _value?: string

	constructor(
		readonly kind: string,
		readonly start: number,
		readonly end: number,
		private readonly text: string,
	) {}

	get value(): string {
		return this._value ??= this.text.slice(this.start, this.end)
	}
}

class Lexer {
	static readonly basicRules = LEXER_BASIC_RULES

	private readonly parser = new Parser()
	get text() { return this.parser.text }
	get escape() { return this.parser.escape }
	set escape(value: string) { this.parser.escape = value }

	private readonly configVersion = new Model(0)
	private readonly _tokens: Computed<TToken[]> = computed(
		() => this.tokenize(),
		[this.parser.text, this.configVersion],
	)

	get tokens(): TToken[] { return this._tokens.value }

	/** `kind`s marcados `trivia: true` nas regras registradas — pra passar direto como `skipKinds` de `Grammar.parse`. */
	get triviaKinds(): Set<string> {
		const kinds = new Set<string>()
		for (const rule of this.rules) if (rule.trivia) kinds.add(rule.kind)
		return kinds
	}

	private rules: TTokenRule[] = []
	private ruleByGate = new Map<ParserGate, TTokenRule>()
	private ahoCorasick!: AhoCorasick
	private ruleByPatternId!: TTokenLiteralRule[]

	/** Reciclados entre chamadas de `tokenizeGap` (e entre `tokenize()`s) — só realoca quando o maior gap já visto cresce. */
	private literalLengthBuffer = new Int32Array(0)
	private literalPatternIdBuffer = new Int32Array(0)

	constructor() {
		this.parser.trackGaps = true
		this.compileLiteralRules();
	}

	private bumpConfig() {
		this.configVersion.set(this.configVersion.value + 1)
	}

	/** Recompila o autômato a partir das regras `literal` — `charClass` e `delimited` não entram aqui. */
	private compileLiteralRules() {
		const patterns: string[] = []
		const ruleByPatternId: TTokenLiteralRule[] = []

		for (const rule of this.rules) {
			if (rule.type !== 'literal') continue
			for (const value of rule.values) {
				ruleByPatternId.push(rule)
				patterns.push(value)
			}
		}

		this.ruleByPatternId = ruleByPatternId
		this.ahoCorasick = AhoCorasick.compile(...patterns)
	}

	addRules(...rules: TTokenRule[]) {
		for (const rule of rules) {
			if (rule.type !== 'delimited') continue
			// Sempre opaco: o Lexer não tokeniza dentro de um delimitado (é o motivo dele existir).
			const gate = new ParserGate(rule.open, rule.close, true, rule.consumeClose ?? true)
			this.ruleByGate.set(gate, rule)
			this.parser.addGates(gate)
		}
		this.rules.push(...rules)
		this.compileLiteralRules();
		this.bumpConfig();
	}

	clearRules() {
		this.rules = []
		this.ruleByGate.clear()
		this.parser.clearGates()
		this.compileLiteralRules();
		this.bumpConfig();
	}

	private tokenize(): TToken[] {
		const text = this.text.value
		const { nodes, gaps } = this.parser.root
		const tokens: TToken[] = []
		const charClassRules = this.rules.filter((rule): rule is TTokenCharClassRule => rule.type === 'charClass')

		// Gates só existem aqui vindos de regras `delimited`, todas opacas -> nunca aninham, então
		// `nodes`/`gaps` (diretos da raiz) já saem cada um em ordem de posição (scan do Parser é
		// estritamente esquerda->direita). Faz merge dos dois em vez de concatenar tudo e dar sort
		// no final — sort seria O(k log k) sobre o total de tokens, não só sobre nodes+gaps.
		// NÃO usar `allGaps` aqui — inclui o gap *interno* de cada node opaco, que o token do node
		// já cobre; usar `allGaps` tokenizaria o miolo do comentário/string de novo como texto solto.
		let nodeIndex = 0
		let gapIndex = 0
		while (nodeIndex < nodes.length || gapIndex < gaps.length) {
			const node = nodes[nodeIndex]
			const gap = gaps[gapIndex]
			if (node && (!gap || node.start < gap.start)) {
				const rule = this.ruleByGate.get(node.gate)! as TTokenDelimitedRule;
				const kind = rule.subtype?.(text, node.start, node.end) ?? rule.kind
				tokens.push(new Token(kind, node.start, node.end, text))
				nodeIndex++
			} else {
				this.tokenizeGap(text, gap.start, gap.end, charClassRules, tokens)
				gapIndex++
			}
		}

		return tokens
	}

	/**
	 * Maximal munch: em cada posição, o candidato (literal ou charClass) mais longo vence; empate
	 * favorece `literal`. Empurra direto em `tokens` — sem array intermediário por gap.
	 *
	 * O melhor match literal por posição fica em 2 `Int32Array` (tamanho = tamanho do gap), preenchidos
	 * via `onMatch` durante o próprio scan — nada de `Map<start, Match[]>` nem array de objetos
	 * `TAhoCorasickMatch`: em texto real, o nº de matches literais (operadores/pontuação de 1-2 chars)
	 * é grande o bastante pra alocação de objeto por match pesar de verdade (ver benchmark). Os buffers
	 * são reciclados entre gaps (só cresce quando precisa) — só o `fill(0)` é por chamada, não a alocação.
	 */
	private tokenizeGap(text: string, from: number, to: number, charClassRules: TTokenCharClassRule[], tokens: TToken[]) {
		const size = to - from
		if (this.literalLengthBuffer.length < size) {
			this.literalLengthBuffer = new Int32Array(size)
			this.literalPatternIdBuffer = new Int32Array(size)
		}
		const bestLiteralLength = this.literalLengthBuffer
		const bestLiteralPatternId = this.literalPatternIdBuffer
		bestLiteralLength.fill(0, 0, size)

		this.ahoCorasick.scan(text, {
			onMatch: (patternId, matchStart, matchEnd) => {
				const idx = matchStart - from
				const length = matchEnd - matchStart
				if (length > bestLiteralLength[idx]) {
					bestLiteralLength[idx] = length
					bestLiteralPatternId[idx] = patternId
				}
				return false // só usamos o efeito colateral acima, scan() não precisa acumular nada
			},
		}, from, to)

		let i = from

		while (i < to) {
			const idx = i - from
			let bestLength = bestLiteralLength[idx]
			let bestKind: string | null = bestLength > 0 ? this.ruleByPatternId[bestLiteralPatternId[idx]].kind : null

			for (const rule of charClassRules) {
				if (!rule.test(text.charCodeAt(i))) continue
				const continueTest = rule.continueTest ?? rule.test
				let j = i + 1
				while (j < to && continueTest(text.charCodeAt(j))) j++
				const length = j - i
				if (length > bestLength) {
					bestLength = length
					bestKind = rule.kind
				}
			}

			const start = i
			// Nenhuma regra cobriu este char: 1 token 'unknown' avulso, pra nunca travar ou pular char em silêncio.
			const end = start + (bestKind === null ? 1 : bestLength)
			tokens.push(new Token(bestKind ?? 'unknown', start, end, text))
			i = end
		}
	}
}

export {
	Lexer,
}
