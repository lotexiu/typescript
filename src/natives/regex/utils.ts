import { REGEX_PATTERNS } from './declarations';

class RegexUtils {
	static readonly #escapeReservedKeyRegex = new RegExp(REGEX_PATTERNS.RESERVED.REGEX_KEYS, 'g');
	static readonly #highSurrogateRegex = new RegExp(REGEX_PATTERNS.UNICODE.HIGH_SURROGATE);
	static readonly patterns = REGEX_PATTERNS;

	static escapeReservedKeys(value: String) {
		const { ESCAPE } = RegexUtils.patterns.RESERVED;
		return value.replace(RegexUtils.#escapeReservedKeyRegex, ESCAPE);
	}

	static hasAstralChar(value: string): boolean {
		return RegexUtils.#highSurrogateRegex.test(value);
	}
}

export { RegexUtils };
