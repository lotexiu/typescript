import { REGEX_PATTERNS } from "./declarations";

class _Regex {
	static readonly patterns = REGEX_PATTERNS;
	private static readonly escapeReservedKeyRegex = new RegExp(REGEX_PATTERNS.RESERVED.REGEX_KEYS, 'g')
	private static readonly highSurrogateRegex = new RegExp(REGEX_PATTERNS.UNICODE.HIGH_SURROGATE)

	static escapeReservedKeys(value: String) {
		const {ESCAPE} = _Regex.patterns.RESERVED
		return value.replace(_Regex.escapeReservedKeyRegex, ESCAPE)
	}

	static hasAstralChar(value: string): boolean {
		return _Regex.highSurrogateRegex.test(value)
	}

}

export {
	_Regex,
}