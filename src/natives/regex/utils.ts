import { REGEX_PATTERNS } from './declarations';

class RegexUtils {
	static readonly #escapeReservedKeyRegex = new RegExp(REGEX_PATTERNS.RESERVED.REGEX_KEYS, 'g');
	static readonly #highSurrogateRegex = new RegExp(REGEX_PATTERNS.UNICODE.HIGH_SURROGATE);
	static readonly #uuidRegex = new RegExp(`^${REGEX_PATTERNS.ID.UUID}$`, 'i');
	static readonly #digitsOnlyRegex = new RegExp(`^${REGEX_PATTERNS.NUMBER.DIGITS_ONLY}$`);
	static readonly #nonDigitRegex = new RegExp(REGEX_PATTERNS.NUMBER.NON_DIGIT, 'g');
	static readonly #leadingZerosRegex = new RegExp(`^${REGEX_PATTERNS.NUMBER.LEADING_ZEROS}`);
	static readonly #trailingZerosRegex = new RegExp(`${REGEX_PATTERNS.NUMBER.TRAILING_ZEROS}$`);
	static readonly patterns = REGEX_PATTERNS;

	static escapeReservedKeys(value: String) {
		const { ESCAPE } = RegexUtils.patterns.RESERVED;
		return value.replace(RegexUtils.#escapeReservedKeyRegex, ESCAPE);
	}

	static hasAstralChar(value: string): boolean {
		return RegexUtils.#highSurrogateRegex.test(value);
	}

	/** UUID textual (qualquer versão 1–8, variante RFC 4122). */
	static isUuid(value: string): boolean {
		return RegexUtils.#uuidRegex.test(value);
	}

	/** Só dígitos `0-9`, ao menos um. */
	static isDigits(value: string): boolean {
		return RegexUtils.#digitsOnlyRegex.test(value);
	}

	/** Remove tudo que não for dígito `0-9`. */
	static stripNonDigits(value: string): string {
		return value.replace(RegexUtils.#nonDigitRegex, '');
	}

	/** `'0042'` → `'42'`; `'000'` → `'0'` (sempre sobra um dígito). */
	static trimLeadingZeros(value: string): string {
		return value.replace(RegexUtils.#leadingZerosRegex, '');
	}

	/** `'1500'` → `'15'`; `'000'` → `''`. */
	static trimTrailingZeros(value: string): string {
		return value.replace(RegexUtils.#trailingZerosRegex, '');
	}
}

export { RegexUtils };
