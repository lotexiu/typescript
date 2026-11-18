import { describe, it, expect } from 'vitest';
import { AhoCorasick } from '@ts/aho-corasick/model';

describe('AhoCorasick.scan — basic matching', () => {
	it('finds a single pattern occurrence', () => {
		const automaton = AhoCorasick.compile('he');
		expect(automaton.scan('she')).toEqual([{ patternId: 0, start: 1, end: 3 }]);
	});

	it('finds multiple non-overlapping occurrences of the same pattern', () => {
		const automaton = AhoCorasick.compile('ab');
		expect(automaton.scan('ababab')).toEqual([
			{ patternId: 0, start: 0, end: 2 },
			{ patternId: 0, start: 2, end: 4 },
			{ patternId: 0, start: 4, end: 6 },
		]);
	});

	it('returns no matches when nothing matches', () => {
		const automaton = AhoCorasick.compile('xyz');
		expect(automaton.scan('hello world')).toEqual([]);
	});

	it('returns no matches for an empty text', () => {
		const automaton = AhoCorasick.compile('a');
		expect(automaton.scan('')).toEqual([]);
	});

	it('handles an empty pattern list without matching anything', () => {
		const automaton = AhoCorasick.compile();
		expect(automaton.scan('anything')).toEqual([]);
	});
});

describe('AhoCorasick.scan — the classic multi-pattern case (he/she/his/hers)', () => {
	it('finds every overlapping match across "ushers"', () => {
		const automaton = AhoCorasick.compile('he', 'she', 'his', 'hers');
		const matches = automaton.scan('ushers');
		const byPattern = (id: number) =>
			matches.filter((match) => match.patternId === id).map((match) => [match.start, match.end]);
		// "ushers" = u(0) s(1) h(2) e(3) r(4) s(5)
		expect(byPattern(0)).toEqual([[2, 4]]); // "he"
		expect(byPattern(1)).toEqual([[1, 4]]); // "she"
		expect(byPattern(2)).toEqual([]); // "his" never occurs in "ushers"
		expect(byPattern(3)).toEqual([[2, 6]]); // "hers" at 2-6
	});
});

describe('AhoCorasick.scan — patterns that are substrings of each other', () => {
	it('reports both the shorter and longer pattern when the longer one matches', () => {
		const automaton = AhoCorasick.compile('a', 'ab', 'abc');
		const matches = automaton.scan('abc');
		expect(matches.map((match) => [match.patternId, match.start, match.end]).sort()).toEqual(
			[
				[0, 0, 1],
				[1, 0, 2],
				[2, 0, 3],
			].sort()
		);
	});

	it('finds a short pattern nested at the end of the text via a failure-link fallback', () => {
		// "aab" — "ab" only matches by falling back through the failure link after "aa" fails
		// to extend into "aab" directly from the "a" branch.
		const automaton = AhoCorasick.compile('ab');
		expect(automaton.scan('aab')).toEqual([{ patternId: 0, start: 1, end: 3 }]);
	});
});

describe('AhoCorasick.scan — duplicate patterns', () => {
	it('reports one match per pattern id, even for identical pattern strings', () => {
		const automaton = AhoCorasick.compile('ab', 'ab');
		const matches = automaton.scan('ab');
		expect(matches.map((match) => match.patternId).sort()).toEqual([0, 1]);
		expect(matches.every((match) => match.start === 0 && match.end === 2)).toBe(true);
	});
});

describe('AhoCorasick.scan — is case-sensitive / exact byte match', () => {
	it('does not match a differently-cased pattern', () => {
		const automaton = AhoCorasick.compile('AB');
		expect(automaton.scan('ab')).toEqual([]);
	});
});

describe('AhoCorasick.scan — hooks', () => {
	it('onMatch returning false suppresses that specific match', () => {
		const automaton = AhoCorasick.compile('a', 'ab');
		const matches = automaton.scan('ab', {
			onMatch: (patternId) => patternId !== 0,
		});
		expect(matches.map((match) => match.patternId)).toEqual([1]);
	});

	it('onMatch is called with the correct patternId/start/end before filtering', () => {
		const automaton = AhoCorasick.compile('ab');
		const calls: Array<[number, number, number]> = [];
		automaton.scan('xab', {
			onMatch: (patternId, start, end) => {
				calls.push([patternId, start, end]);
			},
		});
		expect(calls).toEqual([[0, 1, 3]]);
	});

	it('onPosition can skip a span of characters and resets automaton state', () => {
		const automaton = AhoCorasick.compile('ab');
		// Skip the first 3 characters ("xab") entirely, so the "ab" inside them is never seen,
		// but the trailing "ab" outside the skipped span still matches.
		const matches = automaton.scan('xabcab', {
			onPosition: (index) => (index === 0 ? 3 : undefined),
		});
		expect(matches).toEqual([{ patternId: 0, start: 4, end: 6 }]);
	});

	it('start/end scan bounds restrict matching to that slice of the text', () => {
		const automaton = AhoCorasick.compile('ab');
		expect(automaton.scan('xabxab', {}, 3, 6)).toEqual([{ patternId: 0, start: 4, end: 6 }]);
	});
});
