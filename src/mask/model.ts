import { REGEX_PATTERNS } from "@tsn/regex/declarations";
import { TMaskCompiledPattern, TMaskRule, TMaskToken } from "./types";
import { model } from "@ts/model/model";
import { computed } from "@ts/computed/model";

const { DIGITS, LETTERS, SYMBOLS } = REGEX_PATTERNS

class Mask {
	private static readonly cache = new Map<string, TMaskCompiledPattern[]>()

	private static readonly _rules = model<Map<string, TMaskRule>>(new Map([
		['0', { match: [DIGITS.BASIC] }],
		['A', { match: [DIGITS.BASIC, LETTERS.EXTENDED.ALL], flags: 'v' }],
		['W', { match: [LETTERS.EXTENDED.ALL], flags: 'v' }],
		['U', { match: [LETTERS.EXTENDED.UPPERCASE], flags: 'v' }],
		['L', { match: [LETTERS.EXTENDED.LOWERCASE], flags: 'v' }],
		['S', { match: [SYMBOLS.ALL], flags: 'v' }],
		['C', { match: [SYMBOLS.CURRENCY], flags: 'v' }],
		['E', { match: [SYMBOLS.EMOJI], flags: 'v' }],
		['X', { match: ['.'], flags: 'v' }],
	]))
	private static readonly ruleKeys = computed(() => [...Mask._rules.value.keys()], [Mask._rules])
	private static readonly ruleMatcher = computed(() => {
		const keys = Mask.ruleKeys.value.map(key => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
		return new RegExp(`(${keys.join('|')})(?:\\{(\\d+)(?:,(\\d*))?}|(\\*)|(\\?))?`, 'g')
	}, [Mask.ruleKeys])

	static init() {
		Mask._rules.subscribe(() => {
			this.cache.clear()
		})
	}

	/** Every registered mask token, keyed by its character — read-only, use `setToken` to change it. */
	static get rules(): ReadonlyMap<string, TMaskRule> {
		return Mask._rules.value
	}

	/** Registers or overwrites a mask token character with a new rule, notifying subscribers (and clearing the compile cache) manually. */
	static setToken(key: string, rule: TMaskRule) {
		Mask._rules.value.set(key, rule)
		Mask._rules.notifies(Mask._rules.value)
	}

	private static compile(mask: string): TMaskCompiledPattern[] {
		if (Mask.cache.has(mask)) return Mask.cache.get(mask)!

		const patterns = mask.split('||')
		const compiledPatterns = patterns.map((pattern): TMaskCompiledPattern => {
			const tokens: TMaskToken[] = []
			let lastIndex = 0

			for (const m of pattern.matchAll(Mask.ruleMatcher.value)) {
				if (lastIndex < m.index) {
					tokens.push({ type: 'mask', value: pattern.slice(lastIndex, m.index) })
				}
				lastIndex = m.index + m[0].length

				const [key, braceMin, braceMax, star, question] = m.slice(1)
				const rule = Mask._rules.value.get(key)!
				const value = rule.match.join('|')

				let min = 1
				let max = 1
				if (star) {
					min = 0
					max = Infinity
				} else if (question) {
					min = 0
					max = 1
				} else if (braceMin !== undefined) {
					min = Number(braceMin)
					max = braceMax === undefined ? min : (braceMax === '' ? Infinity : Number(braceMax))
				}

				tokens.push({
					type: 'rule',
					value,
					min,
					max,
					flags: rule.flags,
					test: new RegExp(`^(?:${value})$`, rule.flags),
				})
			}
			if (lastIndex < pattern.length) {
				tokens.push({ type: 'mask', value: pattern.slice(lastIndex) })
			}

			return { source: pattern, tokens }
		})

		Mask.cache.set(mask, compiledPatterns)
		return compiledPatterns
	}

	apply(value: string, mask: string) {
		const raw = this.unapply(value, mask)
		let best = ''

		for (const pattern of Mask.compile(mask)) {
			let formatted = ''
			let pendingLiteral = ''
			let index = 0

			for (const token of pattern.tokens) {
				if (token.type === 'mask') {
					pendingLiteral += token.value
					continue
				}
				if (index >= raw.length) break

				const chunk = raw.slice(index, index + token.max)
				formatted += pendingLiteral + chunk
				pendingLiteral = ''
				index += chunk.length
			}

			if (formatted.length > best.length) best = formatted
		}

		return best
	}

	unapply(value: string, mask: string) {
		let best = ''

		for (const pattern of Mask.compile(mask)) {
			const rules = pattern.tokens.filter(token => token.type === 'rule')
			if (!rules.length) continue

			let ruleIndex = 0
			let count = 0
			let raw = ''

			for (const char of value) {
				if (ruleIndex >= rules.length) break
				const rule = rules[ruleIndex]
				if (!rule.test.test(char)) continue

				raw += char
				if (++count >= rule.max) {
					ruleIndex++
					count = 0
				}
			}

			if (raw.length > best.length) best = raw
		}

		return best
	}

	valid(value: string, mask: string): boolean {
		for (const pattern of Mask.compile(mask)) {
			let index = 0
			let ok = true

			for (const token of pattern.tokens) {
				if (token.type === 'mask') {
					if (!value.startsWith(token.value, index)) {
						ok = false
						break
					}
					index += token.value.length
					continue
				}

				let count = 0
				while (count < token.max && token.test.test(value[index] ?? '')) {
					index++
					count++
				}
				if (count < token.min) {
					ok = false
					break
				}
			}

			if (ok && index === value.length) return true
		}

		return false
	}
}

export {
	Mask
}
