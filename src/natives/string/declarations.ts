/**
 * @internal
 */
const STRING_REGEX = {
	COMBINING_MARKS: new RegExp('[\\u0300-\\u036f]', 'g'),
	NON_SLUG_CHARACTERS: new RegExp('[^a-z0-9 -]', 'g'),
	WHITESPACE_RUNS: new RegExp('\\s+', 'g'),
	HYPHEN_RUNS: new RegExp('-+', 'g'),
	WORD_START: new RegExp('\\b\\w', 'g'),
	LOWER_UPPER_BOUNDARY: new RegExp('([a-z])([A-Z])', 'g'),
	WORD_SEPARATOR_RUNS: new RegExp('[\\s-]+', 'g'),
} as const;

export { STRING_REGEX };
