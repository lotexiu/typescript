import { APSearch } from '@tsnode/advance-pattern-search/0.0.1/APSearch';
import { SPSearch } from '@tsnode/simple-pattern-search/SPSearch';
import { describe, expect, it } from 'vitest';

function createMatchLogger(scope: string) {
	return (value: string, index: number, pattern: string) => {
		console.log(`[${scope}]`, { value, index, pattern });
	};
}

describe('Patterns', () => {
	it('SPSearch (Simple Pattern Search)', () => {
		const search = new SPSearch();
		const matches: string[] = [];
		const mismatches: string[] = [];

		search.content = 'Lorem la lla le sus';
		search.onMismatch = (chars, index) => mismatches.push(`${index}:${chars}`);
		search.addPatterns({
			Lorem: (value, index, pattern) => {
				console.log('[SPSearch]', { value, index, pattern });
				matches.push(`${pattern}@${index}`);
			},
			la: (value, index, pattern) => {
				console.log('[SPSearch]', { value, index, pattern });
				matches.push(`${pattern}@${index}`);
			},
			lla: (value, index, pattern) => {
				console.log('[SPSearch]', { value, index, pattern });
				matches.push(`${pattern}@${index}`);
			},
			le: (value, index, pattern) => {
				console.log('[SPSearch]', { value, index, pattern });
				matches.push(`${pattern}@${index}`);
			},
			sus: (value, index, pattern) => {
				console.log('[SPSearch]', { value, index, pattern });
				matches.push(`${pattern}@${index}`);
			},
		});
		search.resolve();

		expect(matches).toEqual([
			'Lorem@0',
			'la@6',
			'lla@9',
			'la@10',
			'le@13',
			'sus@16',
		]);
		expect(mismatches).toEqual([
			'5: ',
			'8: ',
			'12: ',
			'15: ',
		]);
	}),

	it('APSearch parses literal root and quantified group', () => {
		const ast = APSearch.parse('abc(/d/+)');
		expect(ast).toEqual({
			kind: 'sequence',
			nodes: [
				{ kind: 'literal', value: 'abc' },
				{
					kind: 'repeat',
					node: { kind: 'expression', expression: 'd' },
					quantity: [1, Infinity],
				},
			],
		});
	});

	it('APSearch parses negation and lookaround modifiers', () => {
		expect(APSearch.parse('(!/d)')).toEqual({
			kind: 'not',
			node: { kind: 'expression', expression: 'd' },
		});

		expect(APSearch.parse('(!>l/lorem/)(l/test/)')).toEqual({
			kind: 'sequence',
			nodes: [
				{
					kind: 'assertion',
					direction: 'ahead',
					negative: true,
					node: { kind: 'literal', value: 'lorem' },
				},
				{ kind: 'literal', value: 'test' },
			],
		});

		expect(APSearch.parse('(:l/abc/)')).toEqual({
			kind: 'capture',
			name: 'group1',
			node: { kind: 'literal', value: 'abc' },
		});

		expect(APSearch.parse('(@/word/)')).toEqual({
			kind: 'reference',
			patternId: 'word',
		});
	});

	it('APSearch matches the initial supported syntax set', () => {
		const runSearch = (content: string, patterns: Parameters<APSearch['addPatterns']>[0]) => {
			const search = new APSearch();
			search.content = content;
			search.addPatterns(patterns);
			search.resolve();
			console.log('[APSearch.matches]', search.matches);
			console.log('[APSearch.captures]', search.captures);
			return search.matches;
		};

		expect(runSearch('LoreM', {
			'(il/lorem/)': {
				id: 'insensitive',
				call: createMatchLogger('insensitive'),
			},
		})).toEqual([
			{ id: 'insensitive', pattern: '(il/lorem/)', index: 0, length: 5, value: 'LoreM' },
		]);

		expect(runSearch('abc def', {
			abc: {
				id: 'literal',
				call: createMatchLogger('literal'),
			},
			'(l/abc|def/)': {
				id: 'alternation',
				call: createMatchLogger('alternation'),
			},
		})).toEqual([
			{ id: 'literal', pattern: 'abc', index: 0, length: 3, value: 'abc' },
			{ id: 'alternation', pattern: '(l/abc|def/)', index: 0, length: 3, value: 'abc' },
			{ id: 'alternation', pattern: '(l/abc|def/)', index: 4, length: 3, value: 'def' },
		]);

		expect(runSearch('a12 b7', {
			'(/a/)(/d/+)': {
				id: 'alnum-seq',
				call: createMatchLogger('alnum-seq'),
			},
		})).toEqual([
			{ id: 'alnum-seq', pattern: '(/a/)(/d/+)', index: 0, length: 3, value: 'a12' },
			{ id: 'alnum-seq', pattern: '(/a/)(/d/+)', index: 4, length: 2, value: 'b7' },
		]);

		expect(runSearch('a1 !! b7', {
			'(s/ad/2)': {
				id: 'set',
				call: createMatchLogger('set'),
			},
		})).toEqual([
			{ id: 'set', pattern: '(s/ad/2)', index: 0, length: 2, value: 'a1' },
			{ id: 'set', pattern: '(s/ad/2)', index: 6, length: 2, value: 'b7' },
		]);

		expect(runSearch('( test', {
			'(l/\\(/)': {
				id: 'escape',
				call: createMatchLogger('escape'),
			},
		})).toEqual([
			{ id: 'escape', pattern: '(l/\\(/)', index: 0, length: 1, value: '(' },
		]);

		expect(runSearch('A z 7', {
			'(!/d)': {
				id: 'not-digit',
				call: createMatchLogger('not-digit'),
			},
		})).toEqual([
			{ id: 'not-digit', pattern: '(!/d)', index: 0, length: 1, value: 'A' },
			{ id: 'not-digit', pattern: '(!/d)', index: 1, length: 1, value: ' ' },
			{ id: 'not-digit', pattern: '(!/d)', index: 2, length: 1, value: 'z' },
			{ id: 'not-digit', pattern: '(!/d)', index: 3, length: 1, value: ' ' },
		]);

		expect(runSearch('B7 z9', {
			'(!!/a)(/d)': {
				id: 'double-negation',
				call: createMatchLogger('double-negation'),
			},
		})).toEqual([
			{ id: 'double-negation', pattern: '(!!/a)(/d)', index: 0, length: 2, value: 'B7' },
			{ id: 'double-negation', pattern: '(!!/a)(/d)', index: 3, length: 2, value: 'z9' },
		]);

		expect(runSearch('LoreM lorem test', {
			'(>il/lorem/)(il/lorem/)': {
				id: 'lookahead',
				call: createMatchLogger('lookahead'),
			},
		})).toEqual([
			{ id: 'lookahead', pattern: '(>il/lorem/)(il/lorem/)', index: 0, length: 5, value: 'LoreM' },
			{ id: 'lookahead', pattern: '(>il/lorem/)(il/lorem/)', index: 6, length: 5, value: 'lorem' },
		]);

		expect(runSearch('test lorem', {
			'(!>l/lorem/)(l/test/)': {
				id: 'negative-lookahead',
				call: createMatchLogger('negative-lookahead'),
			},
		})).toEqual([
			{ id: 'negative-lookahead', pattern: '(!>l/lorem/)(l/test/)', index: 0, length: 4, value: 'test' },
		]);

		expect(runSearch('testing nesting', {
			'(l/test/)(<l/test/)(l/ing/)': {
				id: 'lookbehind',
				call: createMatchLogger('lookbehind'),
			},
		})).toEqual([
			{ id: 'lookbehind', pattern: '(l/test/)(<l/test/)(l/ing/)', index: 0, length: 7, value: 'testing' },
		]);

		expect(runSearch('testing ring sing', {
			'(!<l/test/)(l/ing/)': {
				id: 'negative-lookbehind',
				call: createMatchLogger('negative-lookbehind'),
			},
		})).toEqual([
			{ id: 'negative-lookbehind', pattern: '(!<l/test/)(l/ing/)', index: 9, length: 3, value: 'ing' },
			{ id: 'negative-lookbehind', pattern: '(!<l/test/)(l/ing/)', index: 14, length: 3, value: 'ing' },
		]);

		const captureSearch = new APSearch();
		captureSearch.content = 'Ab12';
		captureSearch.addPatterns({
			'(:l/Ab12/)': {
				id: 'capture-seq',
				call: createMatchLogger('capture-seq'),
			},
		});
		captureSearch.resolve();
		console.log('[captureSearch.matches]', captureSearch.matches);
		console.log('[captureSearch.captures]', captureSearch.captures);

		expect(captureSearch.matches).toEqual([
			{ id: 'capture-seq', pattern: '(:l/Ab12/)', index: 0, length: 4, value: 'Ab12' },
		]);

		expect(captureSearch.captures).toEqual([
			{
				id: 'capture-seq',
				pattern: '(:l/Ab12/)',
				index: 0,
				length: 4,
				value: 'Ab12',
				groups: { group1: ['Ab12'] },
				captures: [{ name: 'group1', index: 0, length: 4, value: 'Ab12' }],
			},
		]);

		const captureLiteralSearch = new APSearch();
		captureLiteralSearch.content = 'cd';
		captureLiteralSearch.addPatterns({
			'(:l/cd/)': {
				id: 'capture-literal',
				call: createMatchLogger('capture-literal'),
			},
		});
		captureLiteralSearch.resolve();
		console.log('[captureLiteralSearch.matches]', captureLiteralSearch.matches);
		console.log('[captureLiteralSearch.captures]', captureLiteralSearch.captures);

		expect(captureLiteralSearch.matches).toEqual([
			{ id: 'capture-literal', pattern: '(:l/cd/)', index: 0, length: 2, value: 'cd' },
		]);

		expect(captureLiteralSearch.captures).toEqual([
			{
				id: 'capture-literal',
				pattern: '(:l/cd/)',
				index: 0,
				length: 2,
				value: 'cd',
				groups: { group1: ['cd'] },
				captures: [{ name: 'group1', index: 0, length: 2, value: 'cd' }],
			},
		]);

		const referenceSearch = new APSearch();
		referenceSearch.content = 'abc12 abc';
		referenceSearch.addPatterns({
			'(l/abc/)': {
				id: 'word',
				call: createMatchLogger('word'),
			},
			'(@/word/)(/d/+)': {
				id: 'word-number',
				call: createMatchLogger('word-number'),
			},
			'(:@/word/)': {
				id: 'captured-reference',
				call: createMatchLogger('captured-reference'),
			},
		});
		referenceSearch.resolve();
		console.log('[referenceSearch.matches]', referenceSearch.matches);
		console.log('[referenceSearch.captures]', referenceSearch.captures);

		expect(referenceSearch.matches).toEqual([
			{ id: 'word', pattern: '(l/abc/)', index: 0, length: 3, value: 'abc' },
			{ id: 'word-number', pattern: '(@/word/)(/d/+)', index: 0, length: 5, value: 'abc12' },
			{ id: 'captured-reference', pattern: '(:@/word/)', index: 0, length: 3, value: 'abc' },
			{ id: 'word', pattern: '(l/abc/)', index: 6, length: 3, value: 'abc' },
			{ id: 'captured-reference', pattern: '(:@/word/)', index: 6, length: 3, value: 'abc' },
		]);

		expect(referenceSearch.captures).toEqual([
			{
				id: 'word',
				pattern: '(l/abc/)',
				index: 0,
				length: 3,
				value: 'abc',
				groups: {},
				captures: [],
			},
			{
				id: 'word-number',
				pattern: '(@/word/)(/d/+)',
				index: 0,
				length: 5,
				value: 'abc12',
				groups: {},
				captures: [],
			},
			{
				id: 'captured-reference',
				pattern: '(:@/word/)',
				index: 0,
				length: 3,
				value: 'abc',
				groups: { group1: ['abc'] },
				captures: [{ name: 'group1', index: 0, length: 3, value: 'abc' }],
			},
			{
				id: 'word',
				pattern: '(l/abc/)',
				index: 6,
				length: 3,
				value: 'abc',
				groups: {},
				captures: [],
			},
			{
				id: 'captured-reference',
				pattern: '(:@/word/)',
				index: 6,
				length: 3,
				value: 'abc',
				groups: { group1: ['abc'] },
				captures: [{ name: 'group1', index: 6, length: 3, value: 'abc' }],
			},
		]);
	});

	it('APSearch rejects invalid quantities', () => {
		expect(() => APSearch.parse('(/d/0)')).toThrow('Invalid quantity "0"');
		expect(() => APSearch.parse('(/d/-1)')).toThrow('Invalid quantity "-1"');
		expect(() => APSearch.parse('(/d/2,1)')).toThrow('Invalid quantity "2,1"');
	});

	it('APSearch rejects invalid modifier combinations for the current semantics', () => {
		expect(() => APSearch.parse('(i!/a/)')).toThrow('Modifier "!" cannot be applied after "i"');
		expect(() => APSearch.parse('(><l/a/)')).toThrow('cannot define multiple lookarounds');
		expect(() => APSearch.parse('(>/a/+)')).toThrow('Lookaround assertions cannot be quantified');
		expect(() => APSearch.parse('(:>l/a/)')).toThrow('Capture groups cannot be combined with lookaround assertions');
		expect(() => APSearch.parse('(i@/word/)')).toThrow('cannot combine reference with other content modifiers');

		const missingReference = new APSearch();
		missingReference.content = 'abc';
		missingReference.addPatterns({
			'(@/missing/)': {
				id: 'missing-reference',
				call: createMatchLogger('missing-reference'),
			},
		});
		expect(() => missingReference.resolve()).toThrow('Unknown referenced pattern id "missing"');

		const cyclicReference = new APSearch();
		cyclicReference.content = 'abc';
		cyclicReference.addPatterns({
			'(@/second/)': {
				id: 'first',
				call: createMatchLogger('first'),
			},
			'(@/first/)': {
				id: 'second',
				call: createMatchLogger('second'),
			},
		});
		expect(() => cyclicReference.resolve()).toThrow('Cyclic references are not implemented yet');
	});
});
