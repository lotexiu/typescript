import { REGEX_PATTERNS } from "@tsn/regex/declarations";
import { TMaskRule } from "./types";
import { model } from "@ts/model/model";
import { computed } from "@ts/computed/model";

const { DIGITS, LETTERS, SYMBOLS } = REGEX_PATTERNS

class Mask {
	private static readonly cache = new Map<string, any>()

	private static readonly rules = model<Map<string, TMaskRule>>(new Map([
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
	private static readonly ruleKeys = computed(() => [...Mask.rules.value.keys()], [Mask.rules])
	private static readonly ruleMatcher = computed(() => {
		return new RegExp(`(${Mask.ruleKeys.value.join('|')})(?:\\{(\\d)*,?(\\d)*?}|\\*)?`, 'g')
	}, [Mask.ruleKeys])

	static init() {
		Mask.rules.subscribe(() => {
			this.cache.clear()
		})
	}

	private static compile(mask: string) {
		let value = Mask.cache.get(mask)
		if (value) return value
		const patterns = mask.split('||')
		patterns.forEach((pattern) => {
			const matches = pattern.matchAll(Mask.ruleMatcher.value)
			for (const match of matches) {
				console.log(match)
			}
		})
	}

	apply(value: string, mask: string) {
		let compiledPatterns = Mask.compile(mask)
		// for (const pattern of compiledPatterns) {}
	}
	unapply() { }
	valid() { }
}

export {
	Mask
}
