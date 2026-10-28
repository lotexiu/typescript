import { RegexUtils } from '@tsn/regex/utils';
import { computed } from '@tsr-node/computed/model';
import { signal } from '@tsr-node/signal/model';
import { MaskCompiledPattern } from './compiled-pattern/model';
import { defaultRules } from './declarations';
import { TMaskRuleToken, TMaskStaticToken, TMaskToken } from './token/model';
import { TMaskPad, TMaskRule } from './types';

/** Só o que o motor de caracteres entende (o resto de `TMaskOptions` é do formatador). */
type TEngineOptions = Readonly<{ reversed?: boolean; pad?: TMaskPad }>;

const reverseText = (text: string) => [...text].reverse().join('');

/**
 * Motor de máscaras de caracteres, **por instância**: cada uma tem as próprias regras (as padrão + as que somar),
 * cache de padrões compilados e reatividade. A `Mask` estática usa uma instância padrão.
 */
class MaskEngine {
	readonly #rules = signal<Map<string, TMaskRule>>(new Map());
	readonly rules = computed(() => [...this.#rules().values()]);
	readonly ruleKeys = computed(() => [...this.#rules().keys()]);
	readonly ruleMatcher = computed(() => {
		const keys = this.ruleKeys().map((key) => RegexUtils.escapeReservedKeys(key));
		return new RegExp(`(${keys.join('|')})(?:\\{(\\d+)(?:,(\\d*))?}|(\\*)|(\\?))?`, 'g');
	});

	readonly #cache = new Map<string, MaskCompiledPattern>();
	readonly #patternCache = new Map<string, MaskCompiledPattern[]>();
	readonly #reversedCache = new Map<MaskCompiledPattern, MaskCompiledPattern>();

	constructor(extra: Readonly<Record<string, TMaskRule>> = {}, base?: MaskEngine) {
		const rules = this.#rules();
		for (const [key, rule] of base ? base.#rules() : defaultRules()) rules.set(key, rule);
		for (const [key, rule] of Object.entries(extra)) rules.set(key, rule);
		this.#rules.notify();
		this.#rules.subscribe(() => {
			this.#cache.clear();
			this.#patternCache.clear();
			this.#reversedCache.clear();
		});
	}

	resetRulesToDefault() {
		const rules = this.#rules();
		rules.clear();
		for (const [key, rule] of defaultRules()) rules.set(key, rule);
		this.#rules.notify();
	}

	clearRules() {
		this.#rules().clear();
		this.#rules.notify();
	}

	setRule(key: string, rule: TMaskRule) {
		this.#rules().set(key, rule);
		this.#rules.notify();
	}

	#compile(mask: string): MaskCompiledPattern[] {
		const wholeCached = this.#patternCache.get(mask);
		if (wholeCached) return wholeCached;

		const compiledPatterns: MaskCompiledPattern[] = [];
		for (const pattern of mask.split('||')) {
			const cached = this.#cache.get(pattern);
			if (cached) {
				compiledPatterns.push(cached);
				continue;
			}
			const compiled = this.#compileOne(pattern);
			this.#cache.set(pattern, compiled);
			compiledPatterns.push(compiled);
		}
		this.#patternCache.set(mask, compiledPatterns);
		return compiledPatterns;
	}

	#compileOne(pattern: string): MaskCompiledPattern {
		let maskPos = 0;
		const tokens: TMaskToken[] = [];
		const ruleTokens: TMaskRuleToken[] = [];
		const staticTokens: TMaskStaticToken[] = [];
		const flags = new Set<string>();
		const addStatic = (text: string) => {
			const token = new TMaskStaticToken(text);
			tokens.push(token);
			staticTokens.push(token);
		};

		for (const match of pattern.matchAll(this.ruleMatcher())) {
			const [, key, min = 1, max, star, question] = match;
			const rule = this.#rules().get(key)!;
			if (maskPos < match.index) addStatic(pattern.slice(maskPos, match.index));
			maskPos = match.index + match[0].length;

			const lower = question ? 0 : star ? 0 : Number(min);
			const upper = question ? 1 : star ? Infinity : max === undefined ? Number(min) : max === '' ? Infinity : Number(max);
			const ruleToken = new TMaskRuleToken(rule.match.join('|'), lower, upper, rule.flags);
			tokens.push(ruleToken);
			ruleTokens.push(ruleToken);
			for (const flag of rule.flags ?? '') flags.add(flag);
		}
		if (maskPos < pattern.length) addStatic(pattern.slice(maskPos));
		return new MaskCompiledPattern(pattern, tokens, ruleTokens, staticTokens, [...flags].join(''));
	}

	/** O mesmo padrão lido da direita para a esquerda: preencher "de trás" = preencher o padrão invertido. */
	#reverse(pattern: MaskCompiledPattern): MaskCompiledPattern {
		let reversed = this.#reversedCache.get(pattern);
		if (!reversed) {
			const tokens = [...pattern.tokens].reverse().map((token) => (token instanceof TMaskStaticToken ? new TMaskStaticToken(reverseText(token.value)) : token));
			const ruleTokens = [...pattern.ruleTokens].reverse();
			reversed = new MaskCompiledPattern(`${pattern.source}\u0000reversed`, tokens, ruleTokens, tokens.filter((t) => t instanceof TMaskStaticToken), pattern.flags);
			this.#reversedCache.set(pattern, reversed);
		}
		return reversed;
	}

	#patterns(mask: string, reversed: boolean | undefined): MaskCompiledPattern[] {
		const patterns = this.#compile(mask);
		return reversed ? patterns.map((pattern) => this.#reverse(pattern)) : patterns;
	}

	/** Extrai os caracteres que as regras aceitam (na ordem em que as regras os consomem). */
	#extract(patterns: MaskCompiledPattern[], value: string): string {
		let best = '';
		const chars = RegexUtils.hasAstralChar(value) ? [...value] : value;
		for (const pattern of patterns) {
			const ruleTokens = pattern.ruleTokens;
			if (!ruleTokens.length) continue;
			let ruleIndex = 0;
			let count = 0;
			let raw = '';
			for (let i = 0; i < chars.length && ruleIndex < ruleTokens.length; i++) {
				const char = chars[i];
				if (!ruleTokens[ruleIndex].match().test(char)) continue;
				raw += char;
				if (++count >= ruleTokens[ruleIndex].max) {
					ruleIndex++;
					count = 0;
				}
			}
			if (raw.length > best.length) best = raw;
		}
		return best;
	}

	/** Distribui `raw` pelos tokens, intercalando os literais. Para no primeiro token sem caractere. */
	#fill(patterns: MaskCompiledPattern[], raw: string): string {
		const rawChars = RegexUtils.hasAstralChar(raw) ? [...raw] : null;
		let best = '';
		for (const pattern of patterns) {
			let formatted = '';
			let pendingLiteral = '';
			let index = 0;
			let truncated = false;
			for (const token of pattern.tokens) {
				if (token instanceof TMaskStaticToken) {
					pendingLiteral += token.value;
					continue;
				}
				if (index >= (rawChars ?? raw).length) {
					truncated = true;
					break;
				}
				const taken = (rawChars ?? raw).slice(index, index + token.max);
				formatted += pendingLiteral + (typeof taken === 'string' ? taken : (taken as string[]).join(''));
				pendingLiteral = '';
				index += taken.length;
			}
			if (!truncated) formatted += pendingLiteral;
			if (formatted.length > best.length) best = formatted;
		}
		return best;
	}

	apply(value: string, mask: string, options: TEngineOptions = {}): string {
		const { reversed, pad } = options;
		const patterns = this.#patterns(mask, reversed);
		let raw = this.#extract(patterns, reversed ? reverseText(value) : value);
		if (reversed) raw = reverseText(raw); // volta à ordem de leitura para o preenchimento
		raw = MaskEngine.pad(raw, pad, reversed);
		return reversed ? reverseText(this.#fill(patterns, reverseText(raw))) : this.#fill(patterns, raw);
	}

	unapply(value: string, mask: string, options: TEngineOptions = {}): string {
		const patterns = this.#patterns(mask, options.reversed);
		const raw = this.#extract(patterns, options.reversed ? reverseText(value) : value);
		return options.reversed ? reverseText(raw) : raw;
	}

	valid(value: string, mask: string): boolean {
		return this.#compile(mask).some((pattern) => pattern.validWithMask().test(value));
	}

	validWithoutMask(value: string, mask: string): boolean {
		return this.#compile(mask).some((pattern) => pattern.validWithoutMask().test(value));
	}

	static pad(raw: string, pad: TMaskPad | undefined, reversed: boolean | undefined): string {
		if (!pad || raw === '') return raw;
		const side = pad.side ?? (reversed ? 'start' : 'end');
		return side === 'start' ? raw.padStart(pad.length, pad.char) : raw.padEnd(pad.length, pad.char);
	}
}

export { MaskEngine };
export type { TEngineOptions };
