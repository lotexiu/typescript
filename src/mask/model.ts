import { REGEX_PATTERNS } from "@tsn/regex/declarations";
import { TMaskRule } from "./types";
import { derived, signal } from "@ts/signal/model";
import { TMaskRuleToken, TMaskStaticToken, TMaskToken } from "./token/model";
import { RegexUtils } from "@tsn/regex/utils";
import { MaskCompiledPattern } from "./compiled-pattern/model";

const { DIGITS, LETTERS, SYMBOLS } = REGEX_PATTERNS;

class Mask {
	static readonly #cache = new Map<string, MaskCompiledPattern>();
	static readonly #patternCache = new Map<string, MaskCompiledPattern[]>();

	static readonly #rules = signal<Map<string, TMaskRule>>(new Map());
	static readonly rules = derived(() => [...Mask.#rules().values()]);
	static readonly ruleKeys = derived(() => [...Mask.#rules().keys()]);
	static readonly ruleMatcher = derived(() => {
		const keys = Mask.ruleKeys().map((key) => RegexUtils.escapeReservedKeys(key));
		return new RegExp(`(${keys.join("|")})(?:\\{(\\d+)(?:,(\\d*))?}|(\\*)|(\\?))?`, "g");
	});

	static {
		Mask.resetRulesToDefault();
		Mask.#rules.subscribe(() => {
			Mask.#cache.clear();
			Mask.#patternCache.clear();
		});
	}

	static resetRulesToDefault() {
		const rules = Mask.#rules();
		rules.clear();
		rules.set("0", { match: [DIGITS.BASIC] });
		rules.set("A", { match: [DIGITS.BASIC, LETTERS.EXTENDED.ALL], flags: "v" });
		rules.set("W", { match: [LETTERS.EXTENDED.ALL], flags: "v" });
		rules.set("U", { match: [LETTERS.EXTENDED.UPPERCASE], flags: "v" });
		rules.set("L", { match: [LETTERS.EXTENDED.LOWERCASE], flags: "v" });
		rules.set("S", { match: [SYMBOLS.ALL], flags: "v" });
		rules.set("C", { match: [SYMBOLS.CURRENCY], flags: "v" });
		rules.set("E", { match: [SYMBOLS.EMOJI], flags: "v" });
		rules.set("X", { match: ["."], flags: "v" });
		Mask.#rules.notify();
	}

	static clearRules() {
		Mask.#rules().clear();
		Mask.#rules.notify();
	}

	static setRule(key: string, rule: TMaskRule) {
		Mask.#rules().set(key, rule);
		Mask.#rules.notify();
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

			for (const match of pattern.matchAll(Mask.ruleMatcher())) {
				const [_, key, min = 1, max, star, question] = match;
				const rule = Mask.#rules().get(key)!;

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
