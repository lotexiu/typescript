import { REGEX_PATTERNS } from "@tsn/regex/declarations";
import { TMaskRule } from "./types";
import { model } from "@ts/model/model";
import { computed } from "@ts/computed/model";
import { TMaskRuleToken, TMaskStaticToken, TMaskToken } from "./token/model";
import { RegexUtils } from "@tsn/regex/utils";
import { MaskCompiledPattern } from "./compiled-pattern/model";

const { DIGITS, LETTERS, SYMBOLS } = REGEX_PATTERNS;

class Mask {
	static readonly #cache = new Map<string, MaskCompiledPattern>();
	static readonly #patternCache = new Map<string, MaskCompiledPattern[]>();

	static readonly #rules = model<Map<string, TMaskRule>>(new Map());
	static readonly rules = computed(() => [...Mask.#rules.value.values()], [Mask.#rules]);
	static readonly ruleKeys = computed(() => [...Mask.#rules.value.keys()], [Mask.#rules]);
	static readonly ruleMatcher = computed(() => {
		const keys = Mask.ruleKeys.value.map((key) => RegexUtils.escapeReservedKeys(key));
		return new RegExp(`(${keys.join("|")})(?:\\{(\\d+)(?:,(\\d*))?}|(\\*)|(\\?))?`, "g");
	}, [Mask.ruleKeys]);

	static {
		Mask.resetRulesToDefault();
		Mask.#rules.subscribe(() => {
			Mask.#cache.clear();
			Mask.#patternCache.clear();
		});
	}

	static resetRulesToDefault() {
		Mask.#rules.value.clear();
		Mask.#rules.value.set("0", { match: [DIGITS.BASIC] });
		Mask.#rules.value.set("A", { match: [DIGITS.BASIC, LETTERS.EXTENDED.ALL], flags: "v" });
		Mask.#rules.value.set("W", { match: [LETTERS.EXTENDED.ALL], flags: "v" });
		Mask.#rules.value.set("U", { match: [LETTERS.EXTENDED.UPPERCASE], flags: "v" });
		Mask.#rules.value.set("L", { match: [LETTERS.EXTENDED.LOWERCASE], flags: "v" });
		Mask.#rules.value.set("S", { match: [SYMBOLS.ALL], flags: "v" });
		Mask.#rules.value.set("C", { match: [SYMBOLS.CURRENCY], flags: "v" });
		Mask.#rules.value.set("E", { match: [SYMBOLS.EMOJI], flags: "v" });
		Mask.#rules.value.set("X", { match: ["."], flags: "v" });
		Mask.#rules.notifies(Mask.#rules.value);
	}

	static clearRules() {
		Mask.#rules.value.clear();
		Mask.#rules.notifies(Mask.#rules.value);
	}

	static setRule(key: string, rule: TMaskRule) {
		Mask.#rules.value.set(key, rule);
		Mask.#rules.notifies(Mask.#rules.value);
	}

	static #compile(mask: string): MaskCompiledPattern[] {
		const wholeCached = Mask.#patternCache.get(mask);
		if (wholeCached) return wholeCached;

		const patterns = mask.split("||");
		const compiledPatterns: MaskCompiledPattern[] = [];

		for (const pattern of patterns) {
			/* Already Compiled */
			const cached = Mask.#cache.get(pattern);
			if (cached) {
				compiledPatterns.push(cached);
				continue;
			}
			/* Compiling Pattern */
			let maskPos = 0;
			let tokens: TMaskToken[] = [];
			let ruleTokens: TMaskRuleToken[] = [];
			let staticTokens: TMaskStaticToken[] = [];
			let flags = new Set<string>();

			for (const match of pattern.matchAll(Mask.ruleMatcher.value)) {
				const [_, key, min = 1, max, star, question] = match;
				const rule = Mask.#rules.value.get(key)!;

				if (maskPos < match.index) {
					const staticToken = new TMaskStaticToken(pattern.slice(maskPos, match.index));
					tokens.push(staticToken);
					staticTokens.push(staticToken);
				}
				maskPos = match.index + match[0].length;

				const ruleToken = new TMaskRuleToken(
					rule.match.join("|"),
					question ? 0
					: star ? 0
					: Number(min),
					question ? 1
					: star ? Infinity
					: max === undefined ? Number(min)
					: max === "" ? Infinity
					: Number(max),
					rule.flags,
				);
				tokens.push(ruleToken);
				ruleTokens.push(ruleToken);
				rule.flags?.forEach((flag) => flags.add(flag));
			}
			if (maskPos < pattern.length) {
				const staticToken = new TMaskStaticToken(pattern.slice(maskPos));
				tokens.push(staticToken);
				staticTokens.push(staticToken);
			}
			/* Compiled Pattern */
			const compiledPattern = new MaskCompiledPattern(pattern, tokens, ruleTokens, staticTokens, [...flags.values()].join(""));
			Mask.#cache.set(pattern, compiledPattern);
			compiledPatterns.push(compiledPattern);
		}
		Mask.#patternCache.set(mask, compiledPatterns);
		return compiledPatterns;
	}

	static apply(value: string, mask: string) {
		const raw = Mask.unapply(value, mask);
		const rawChars = RegexUtils.hasAstralChar(raw) ? [...raw] : null;
		let best = "";

		for (const pattern of Mask.#compile(mask)) {
			let formatted = "";
			let pendingLiteral = "";
			let index = 0;
			let truncated = false;

			for (const token of pattern.tokens) {
				if (token instanceof TMaskStaticToken) {
					pendingLiteral += token.value;
					continue;
				}
				if (index >= (rawChars??raw).length) {
					truncated = true
					break
				}
				const takenChars = (rawChars??raw).slice(index, index + token.max)
				formatted += pendingLiteral + (typeof takenChars == 'string' ? takenChars : (takenChars as string[]).join(''))
				pendingLiteral = ''
				index += takenChars.length
			}
			if (!truncated) formatted += pendingLiteral
			if (formatted.length > best.length) best = formatted
		}

		return best;
	}

	static unapply(value: string, mask: string) {
		let best = "";
		const chars = RegexUtils.hasAstralChar(value) ? [...value] : value;

		for (const pattern of Mask.#compile(mask)) {
			const ruleTokens = pattern.ruleTokens;
			if (!ruleTokens.length) continue;

			let ruleIndex = 0;
			let count = 0;
			let raw = "";

			for (let i = 0; i < chars.length && ruleIndex < ruleTokens.length; i++) {
				const char = chars[i];
				const rule = ruleTokens[ruleIndex];
				if (!rule.match.value.test(char)) continue;

				raw += char;
				if (++count >= rule.max) {
					ruleIndex++;
					count = 0;
				}
			}

			if (raw.length > best.length) best = raw;
		}

		return best;
	}

	static valid(value: string, mask: string): boolean {
		return Mask.#compile(mask).some((pattern) => pattern.validWithMask.value.test(value));
	}

	static validWithoutMask(value: string, mask: string): boolean {
		return Mask.#compile(mask).some((pattern) => pattern.validWithoutMask.value.test(value));
	}
}

export { Mask };
