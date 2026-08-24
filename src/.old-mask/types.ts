/** The named character class a mask token matches (`digit`, `letter`, ...), or a custom key registered via `MaskUtils.registerToken`. */
type TMaskTokenKind =
	| 'digit'
	| 'letterOrDigit'
	| 'letter'
	| 'uppercaseLetter'
	| 'lowercaseLetter'
	| 'any'
	| (string & {});

/** Predicate a mask token uses to test whether a single character matches it. */
type TMaskTokenMatcher = (char: string) => boolean;

/** A registered mask token: its named kind (for display/diagnostics) and the matcher it validates characters against. */
type TMaskTokenRule = {
	kind?: TMaskTokenKind;
	match: TMaskTokenMatcher;
};

/** One parsed element of a compiled mask pattern — either a literal character to insert as-is, or a token slot with a min/max repeat count. */
type TMaskParserEntry =
	| {
			kind: 'literal';
			value: string;
	  }
	| {
			kind: 'token';
			token: TMaskTokenKind;
			key: string;
			min: number;
			max: number;
	  };

/** A single compiled alternative of a mask (masks can have `||`-separated alternative patterns) — its parsed entries and how many are token slots. */
type TMaskCompiledPattern = {
	source: string;
	entries: TMaskParserEntry[];
	tokenCount: number;
};

/** The fully compiled form of a mask string — every `||`-separated alternative pattern, ready for `apply`/`unapply`/`isValid` to try against a value. */
type TMaskCompiled = {
	source: string;
	patterns: TMaskCompiledPattern[];
};

/** Options for `MaskUtils.apply` — `applyWhenValid` restricts formatting to only fully-valid values. */
type TMaskApplyOptions = {
	applyWhenValid?: boolean;
};


export {
	TMaskTokenKind,
	TMaskTokenMatcher,
	TMaskTokenRule,
	TMaskParserEntry,
	TMaskCompiledPattern,
	TMaskCompiled,
	TMaskApplyOptions,
}