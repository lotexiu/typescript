import { describe, it, expect, beforeEach } from 'vitest';
import { Mask } from '@ts/mask/model';

beforeEach(() => {
	Mask.resetRulesToDefault();
});

describe('Mask.apply', () => {
	it('formats raw digits into a phone-style mask', () => {
		expect(Mask.apply('11987654321', '(00) 00000-0000')).toBe('(11) 98765-4321');
	});

	it('handles partial input, stopping at the last fully-formatted literal', () => {
		expect(Mask.apply('119', '(00) 00000-0000')).toBe('(11) 9');
	});

	it('picks the best-matching alternative when multiple are given', () => {
		expect(Mask.apply('11987654321', '(00) 00000-0000||(00) 0000-0000')).toBe('(11) 98765-4321');
	});

	// KNOWN ISSUE (not fixed here — a tie-break heuristic question, not a one-line bug):
	// `apply()` picks the "best" alternative by comparing raw *formatted string length*
	// (literals included), not by which alternative actually completes without truncation.
	// With exactly 10 digits, the complete 10-digit alternative and the truncated attempt at
	// the 11-digit alternative tie at 14 characters, and the first-listed (truncated, "...432"
	// instead of a full "...5432" group) one wins the strict `>` comparison. Documented as
	// current behavior; flagged to the author rather than silently changing the heuristic.
	it('can pick a truncated alternative over a complete one when their formatted lengths tie', () => {
		expect(Mask.apply('1198765432', '(00) 00000-0000||(00) 0000-0000')).toBe('(11) 98765-432');
	});

	it('ignores characters already present that do not belong to any rule', () => {
		expect(Mask.apply('(11) 98765-4321', '(00) 00000-0000')).toBe('(11) 98765-4321');
	});
});

describe('Mask.unapply', () => {
	it('extracts only the raw rule-matching characters', () => {
		expect(Mask.unapply('(11) 98765-4321', '(00) 00000-0000')).toBe('11987654321');
	});

	it('returns an empty string when nothing matches', () => {
		expect(Mask.unapply('abc', '0000')).toBe('');
	});
});

describe('Mask.valid / validWithoutMask — digit-only rule (no alternation, unaffected)', () => {
	it('accepts a value with exactly the right shape and digit count', () => {
		expect(Mask.valid('(11) 98765-4321', '(00) 00000-0000')).toBe(true);
	});

	it('rejects a value with the wrong number of digits', () => {
		expect(Mask.valid('(11) 9876-4321', '(00) 00000-0000')).toBe(false);
	});

	it('rejects a value missing the mask literals', () => {
		expect(Mask.valid('11987654321', '(00) 00000-0000')).toBe(false);
	});

	it('validWithoutMask accepts the raw digits with no literals', () => {
		expect(Mask.validWithoutMask('11987654321', '(00) 00000-0000')).toBe(true);
	});

	it('respects quantified digit-only tokens like 0{3}', () => {
		expect(Mask.valid('123', '0{3}')).toBe(true);
		expect(Mask.valid('12', '0{3}')).toBe(false);
		expect(Mask.valid('1234', '0{3}')).toBe(false);
	});
});

describe('Mask.valid — multi-alternative rule (the "A" rule: digits OR letters)', () => {
	// The "A" rule matches [0-9] OR letters — every character individually clearly satisfies
	// the rule, so validating a 3-alphanumeric-character token against "A{3}" should accept
	// exactly 3-character alphanumeric strings and reject strings of the wrong length.
	it('accepts a 3-character alphanumeric string against A{3}', () => {
		expect(Mask.valid('a1b', 'A{3}')).toBe(true);
	});

	it('rejects a 1-character string against A{3} (too short)', () => {
		expect(Mask.valid('5', 'A{3}')).toBe(false);
	});

	it('rejects a 5-character string against A{3} (too long)', () => {
		expect(Mask.valid('abcde', 'A{3}')).toBe(false);
	});

	it('rejects a string with a non-alphanumeric character against A{3}', () => {
		expect(Mask.valid('a-b', 'A{3}')).toBe(false);
	});
});
