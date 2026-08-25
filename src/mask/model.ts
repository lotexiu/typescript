import { REGEX_PATTERNS } from "@tsn/regex/declarations";
import { TMaskCompiledPattern, TMaskRule } from "./types";
import { model } from "@ts/model/model";
import { computed } from "@ts/computed/model";
import { TMaskRuleToken, TMaskToken } from "./token/model";
import { _Regex } from "@tsn/regex/implementations";

const { DIGITS, LETTERS, SYMBOLS } = REGEX_PATTERNS

class Mask {
	private static readonly cache = new Map<string, TMaskCompiledPattern>()

	private static readonly _rules = model<Map<string, TMaskRule>>(new Map())
	static readonly rules = computed(() => [...Mask._rules.value.values()], [Mask._rules])
	static readonly ruleKeys = computed(() => [...Mask._rules.value.keys()], [Mask._rules])
	static readonly ruleMatcher = computed(() => {
		const keys = Mask.ruleKeys.value.map(key => _Regex.escapeReservedKeys(key))
		return new RegExp(`(${keys.join('|')})(?:\\{(\\d+)(?:,(\\d*))?}|(\\*)|(\\?))?`, 'g')
	}, [Mask.ruleKeys])

	static {
		Mask.resetRulesToDefault();
		Mask._rules.subscribe(() => Mask.cache.clear())
	}

	static resetRulesToDefault() {
		Mask._rules.value.clear()
		Mask._rules.value.set('0', { match: [DIGITS.BASIC] })
		Mask._rules.value.set('A', { match: [DIGITS.BASIC, LETTERS.EXTENDED.ALL], flags: 'v' })
		Mask._rules.value.set('W', { match: [LETTERS.EXTENDED.ALL], flags: 'v' })
		Mask._rules.value.set('U', { match: [LETTERS.EXTENDED.UPPERCASE], flags: 'v' })
		Mask._rules.value.set('L', { match: [LETTERS.EXTENDED.LOWERCASE], flags: 'v' })
		Mask._rules.value.set('S', { match: [SYMBOLS.ALL], flags: 'v' })
		Mask._rules.value.set('C', { match: [SYMBOLS.CURRENCY], flags: 'v' })
		Mask._rules.value.set('E', { match: [SYMBOLS.EMOJI], flags: 'v' })
		Mask._rules.value.set('X', { match: ['.'], flags: 'v' })
		Mask._rules.notifies(Mask._rules.value)
	}

	static clearRules() {
		Mask._rules.value.clear()
		Mask._rules.notifies(Mask._rules.value)
	}

	static setRule(key: string, rule: TMaskRule) {
		Mask._rules.value.set(key, rule)
		Mask._rules.notifies(Mask._rules.value)
	}

	private static compile(mask: string): TMaskCompiledPattern[] {
		const patterns = mask.split('||')
		const compiledPatterns: TMaskCompiledPattern[] = []

		for (const pattern of patterns) {
			if (Mask.cache.has(pattern)) {
				compiledPatterns.push(Mask.cache.get(pattern)!)
				continue;
			}
			const tokens: TMaskToken[] = []
			let lastIndex = 0

			for (const m of pattern.matchAll(Mask.ruleMatcher.value)) {
				if (lastIndex < m.index) {
					tokens.push(new TMaskToken(pattern.slice(lastIndex, m.index)))
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

				tokens.push(new TMaskRuleToken(value, min, max, rule.flags))
			}
			if (lastIndex < pattern.length) {
				tokens.push(new TMaskToken(pattern.slice(lastIndex)))
			}
			const compiledPattern: TMaskCompiledPattern = {
				source: pattern,
				ruleTokens: tokens.filter(token => token instanceof TMaskRuleToken),
				tokens
			}
			Mask.cache.set(pattern, compiledPattern)
			compiledPatterns.push(compiledPattern)
		}

		return compiledPatterns
	}

	static apply(value: string, mask: string) {
		const raw = Mask.unapply(value, mask)
		let best = ''

		if (_Regex.hasAstralChar(raw)) {
			const rawChars = [...raw]
			for (const pattern of Mask.compile(mask)) {
				let formatted = ''
				let pendingLiteral = ''
				let index = 0
				let truncated = false

				for (const token of pattern.tokens) {
					if (token instanceof TMaskToken) {
						pendingLiteral += token.value
						continue
					}
					if (index >= rawChars.length) {
						truncated = true
						break
					}

					const takenChars = rawChars.slice(index, index + token.max)
					formatted += pendingLiteral + takenChars.join('')
					pendingLiteral = ''
					index += takenChars.length
				}
				if (!truncated) formatted += pendingLiteral
				if (formatted.length > best.length) best = formatted
			}
			return best
		}

		for (const pattern of Mask.compile(mask)) {
			let formatted = ''
			let pendingLiteral = ''
			let index = 0
			let truncated = false

			for (const token of pattern.tokens) {
				if (token instanceof TMaskToken) {
					pendingLiteral += token.value
					continue
				}
				if (index >= raw.length) {
					truncated = true
					break
				}

				const chunk = raw.slice(index, index + token.max)
				formatted += pendingLiteral + chunk
				pendingLiteral = ''
				index += chunk.length
			}
			if (!truncated) formatted += pendingLiteral
			if (formatted.length > best.length) best = formatted
		}

		return best
	}

	static unapply(value: string, mask: string) {
		let best = ''

		for (const pattern of Mask.compile(mask)) {
			if (!pattern.ruleTokens.length) continue

			let ruleIndex = 0
			let count = 0
			let raw = ''

			for (const char of value) {
				if (ruleIndex >= pattern.ruleTokens.length) break
				const rule = pattern.ruleTokens[ruleIndex]
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

	static valid(value: string, mask: string): boolean {
		const hasAstral = _Regex.hasAstralChar(value)
		for (const pattern of Mask.compile(mask)) {
			let index = 0
			let ok = true

			for (const token of pattern.tokens) {
				if (token instanceof TMaskToken) {
					if (!value.startsWith(token.value, index)) {
						ok = false
						break
					}
					index += token.value.length
					continue
				}

				let count = 0
				while (count < token.max) {
					if (!hasAstral) {
						if (!token.test.test(value[index] ?? '')) break
						index++
						count++
						continue
					}

					const codePoint = index < value.length ? value.codePointAt(index) : undefined
					const char = codePoint === undefined ? '' : String.fromCodePoint(codePoint)
					if (!token.test.test(char)) break
					index += char.length
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
