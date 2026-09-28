import { describe, it, expect } from 'vitest';
import { StringUtils } from '@tsn-string/utils';

describe('StringUtils.toKebabCase', () => {
	it('converts camelCase to kebab-case', () => {
		expect(StringUtils.toKebabCase('helloWorld')).toBe('hello-world');
	});

	it('lowercases a leading capital without a leading dash', () => {
		expect(StringUtils.toKebabCase('HelloWorld')).toBe('hello-world');
	});

	it('leaves already-kebab text untouched', () => {
		expect(StringUtils.toKebabCase('hello-world')).toBe('hello-world');
	});
});

describe('StringUtils.capitalize', () => {
	it('uppercases the first letter', () => {
		expect(StringUtils.capitalize('hello')).toBe('Hello');
	});

	it('handles accented first letters', () => {
		expect(StringUtils.capitalize('ítalo')).toBe('Ítalo');
	});

	it('returns an empty string unchanged', () => {
		expect(StringUtils.capitalize('')).toBe('');
	});

	// Regression for the 2026-08-25 bug: charAt(0)/toUpperCase() split surrogate pairs.
	it('does not corrupt a leading astral character (surrogate pair)', () => {
		expect(StringUtils.capitalize('😀bc')).toBe('😀bc');
	});
});

describe('StringUtils.capitalizeAll', () => {
	it('capitalizes every segment split by the given separator', () => {
		expect(StringUtils.capitalizeAll('hello world', ' ')).toBe('Hello World');
	});

	it('re-joins using the same separator', () => {
		expect(StringUtils.capitalizeAll('a-b-c', '-')).toBe('A-B-C');
	});
});

describe('StringUtils.padRight / padLeft', () => {
	it('padRight appends the pad character up to the target length', () => {
		expect(StringUtils.padRight('ab', '0', 5)).toBe('ab000');
	});

	it('padLeft prepends the pad character up to the target length', () => {
		expect(StringUtils.padLeft('ab', '0', 5)).toBe('000ab');
	});

	it('padRight is a no-op when the string already meets the target length', () => {
		expect(StringUtils.padRight('hello', '0', 5)).toBe('hello');
	});

	it('padRight does not throw when the string is already longer than the target length', () => {
		expect(() => StringUtils.padRight('hello', '0', 3)).not.toThrow();
		expect(StringUtils.padRight('hello', '0', 3)).toBe('hello');
	});

	it('padLeft does not throw when the string is already longer than the target length', () => {
		expect(() => StringUtils.padLeft('hello', '0', 3)).not.toThrow();
		expect(StringUtils.padLeft('hello', '0', 3)).toBe('hello');
	});
});

describe('StringUtils.noAccent', () => {
	it('strips diacritics', () => {
		expect(StringUtils.noAccent('café')).toBe('cafe');
		expect(StringUtils.noAccent('ÀÉÎÕÜ')).toBe('AEIOU');
	});

	it('leaves plain ASCII untouched', () => {
		expect(StringUtils.noAccent('hello')).toBe('hello');
	});
});

describe('StringUtils.charCodeArray', () => {
	it('returns raw numeric UTF-16 code units, not hex strings', () => {
		expect(StringUtils.charCodeArray('AB')).toEqual([65, 66]);
	});

	it('returns an empty array for an empty string', () => {
		expect(StringUtils.charCodeArray('')).toEqual([]);
	});

	it('treats a surrogate pair as two separate code units (by design, low-level API)', () => {
		expect(StringUtils.charCodeArray('😀')).toHaveLength(2);
	});
});

describe('StringUtils.isLetter / isLowerCase / isUpperCase', () => {
	it('basic mode recognizes ASCII letters and case', () => {
		expect(StringUtils.isLetter('a')).toBe(true);
		expect(StringUtils.isLetter('1')).toBe(false);
		expect(StringUtils.isLowerCase('a')).toBe(true);
		expect(StringUtils.isUpperCase('A')).toBe(true);
		expect(StringUtils.isLowerCase('A')).toBe(false);
	});

	it('basic mode does not recognize accented letters', () => {
		expect(StringUtils.isLetter('é')).toBe(false);
	});

	it('extended mode recognizes accented letters and their case', () => {
		expect(StringUtils.isLetter('é', true)).toBe(true);
		expect(StringUtils.isLowerCase('é', true)).toBe(true);
		expect(StringUtils.isUpperCase('É', true)).toBe(true);
	});

	it('extended mode recognizes non-Latin letters', () => {
		expect(StringUtils.isLetter('中', true)).toBe(true);
	});
});

describe('StringUtils.isDigit', () => {
	it('basic mode checks the whole string when no index is given', () => {
		expect(StringUtils.isDigit('12345')).toBe(true);
		expect(StringUtils.isDigit('123a5')).toBe(false);
	});

	it('basic mode checks a single position when an index is given', () => {
		expect(StringUtils.isDigit('a1b', 1)).toBe(true);
		expect(StringUtils.isDigit('a1b', 0)).toBe(false);
	});

	it('extended mode recognizes non-ASCII decimal digits', () => {
		expect(StringUtils.isDigit('٥', undefined, true)).toBe(true); // Arabic-indic digit 5
	});

	it('is true (vacuously) for an empty string with no index', () => {
		expect(StringUtils.isDigit('')).toBe(true);
	});
});

describe('StringUtils.isLetterOrDigit', () => {
	it('is true for letters and digits', () => {
		expect(StringUtils.isLetterOrDigit('a')).toBe(true);
		expect(StringUtils.isLetterOrDigit('5')).toBe(true);
	});

	it('is false for symbols', () => {
		expect(StringUtils.isLetterOrDigit('!')).toBe(false);
	});
});

describe('StringUtils.isIdentifier', () => {
	it('accepts letters, digits, underscore and dollar sign', () => {
		expect(StringUtils.isIdentifier('a')).toBe(true);
		expect(StringUtils.isIdentifier('5')).toBe(true);
		expect(StringUtils.isIdentifier('_')).toBe(true);
		expect(StringUtils.isIdentifier('$')).toBe(true);
	});

	it('rejects punctuation and whitespace', () => {
		expect(StringUtils.isIdentifier('-')).toBe(false);
		expect(StringUtils.isIdentifier(' ')).toBe(false);
	});
});

describe('StringUtils.isHexadecimal', () => {
	it('accepts short and even-length hex strings', () => {
		expect(StringUtils.isHexadecimal('1a2B3c')).toBe(true);
		expect(StringUtils.isHexadecimal('a')).toBe(true);
		expect(StringUtils.isHexadecimal('abcd')).toBe(true);
	});

	it('rejects non-hex characters', () => {
		expect(StringUtils.isHexadecimal('gg')).toBe(false);
	});

	it('rejects an odd-length string longer than 4 characters', () => {
		expect(StringUtils.isHexadecimal('abcde')).toBe(false);
	});

	it('accepts an even-length string longer than 4 characters', () => {
		expect(StringUtils.isHexadecimal('abcdef')).toBe(true);
	});
});

describe('StringUtils.isFormatting', () => {
	it('recognizes space, tab and carriage return in basic mode', () => {
		expect(StringUtils.isFormatting(' ')).toBe(true);
		expect(StringUtils.isFormatting('\t')).toBe(true);
		expect(StringUtils.isFormatting('\r')).toBe(true);
	});

	it('is false for a regular letter', () => {
		expect(StringUtils.isFormatting('a')).toBe(false);
	});
});

describe('StringUtils.isWhitespace', () => {
	it('recognizes space, newline, carriage return and tab', () => {
		expect(StringUtils.isWhitespace(' ')).toBe(true);
		expect(StringUtils.isWhitespace('\n')).toBe(true);
		expect(StringUtils.isWhitespace('\r')).toBe(true);
		expect(StringUtils.isWhitespace('\t')).toBe(true);
	});

	it('is false for a non-whitespace character', () => {
		expect(StringUtils.isWhitespace('a')).toBe(false);
	});

	it('extended mode recognizes unicode space separators', () => {
		expect(StringUtils.isWhitespace(' ', true)).toBe(true); // no-break space
	});
});

describe('StringUtils.isLineBreak / isTab / isCarriageReturn / isFormFeed / isVerticalTab', () => {
	it('each recognizes only its own control character', () => {
		expect(StringUtils.isLineBreak('\n')).toBe(true);
		expect(StringUtils.isLineBreak('\r')).toBe(true);
		expect(StringUtils.isLineBreak('a')).toBe(false);
		expect(StringUtils.isTab('\t')).toBe(true);
		expect(StringUtils.isTab('a')).toBe(false);
		expect(StringUtils.isCarriageReturn('\r')).toBe(true);
		expect(StringUtils.isFormFeed('\f')).toBe(true);
		expect(StringUtils.isVerticalTab('\v')).toBe(true);
	});
});

describe('StringUtils.isMathOperator / isRelationalOperator / isBitwireOperator', () => {
	it('recognizes math operators', () => {
		for (const c of ['+', '-', '*', '/', '%', '^']) expect(StringUtils.isMathOperator(c)).toBe(true);
		expect(StringUtils.isMathOperator('a')).toBe(false);
	});

	it('recognizes relational operators', () => {
		for (const c of ['>', '<', '=', '!']) expect(StringUtils.isRelationalOperator(c)).toBe(true);
		expect(StringUtils.isRelationalOperator('a')).toBe(false);
	});

	it('recognizes bitwise operators', () => {
		for (const c of ['&', '|', '^', '~']) expect(StringUtils.isBitwireOperator(c)).toBe(true);
		expect(StringUtils.isBitwireOperator('a')).toBe(false);
	});
});

describe('StringUtils.isPunctuation', () => {
	it('recognizes common ASCII punctuation in basic mode', () => {
		for (const c of ['.', ',', ';', ':', '(', ')', '"', "'"]) {
			expect(StringUtils.isPunctuation(c)).toBe(true);
		}
	});

	it('is false for a letter', () => {
		expect(StringUtils.isPunctuation('a')).toBe(false);
	});

	it('extended mode uses the unicode punctuation class', () => {
		expect(StringUtils.isPunctuation('。', true)).toBe(true); // ideographic full stop
	});
});

describe('StringUtils.isSymbol', () => {
	it('is true for punctuation and other non-letter/digit/whitespace characters', () => {
		expect(StringUtils.isSymbol('!')).toBe(true);
		expect(StringUtils.isSymbol('$')).toBe(true);
	});

	it('is false for letters, digits and whitespace', () => {
		expect(StringUtils.isSymbol('a')).toBe(false);
		expect(StringUtils.isSymbol('5')).toBe(false);
		expect(StringUtils.isSymbol(' ')).toBe(false);
	});
});

describe('StringUtils.isEscape', () => {
	it('is true only for a backslash', () => {
		expect(StringUtils.isEscape('\\')).toBe(true);
		expect(StringUtils.isEscape('/')).toBe(false);
	});
});

describe('StringUtils.forEach', () => {
	it('iterates ASCII strings one code unit at a time with size 1', () => {
		const seen: Array<[string, number, number]> = [];
		StringUtils.forEach('abc', (char, index, size) => seen.push([char, index, size]));
		expect(seen).toEqual([
			['a', 0, 1],
			['b', 1, 1],
			['c', 2, 1],
		]);
	});

	it('iterates by grapheme when the string has astral characters, reporting surrogate-pair size 2', () => {
		const seen: Array<[string, number, number]> = [];
		StringUtils.forEach('a😀b', (char, index, size) => seen.push([char, index, size]));
		expect(seen).toEqual([
			['a', 0, 1],
			['😀', 1, 2],
			['b', 3, 1],
		]);
	});

	it('does not split a ZWJ family emoji into its parts', () => {
		const seen: string[] = [];
		StringUtils.forEach('👨‍👩‍👧', (char) => seen.push(char));
		expect(seen).toEqual(['👨‍👩‍👧']);
	});
});

describe('StringUtils.onChar', () => {
	it('finds only the requested characters, reporting index and size', () => {
		const onVowel = StringUtils.onChar('aeiou');
		const hits: Array<[number, number]> = [];
		onVowel('hello world', (index, size) => hits.push([index, size]));
		expect(hits).toEqual([
			[1, 1],
			[4, 1],
			[7, 1],
		]);
	});

	it('matches an astral target character as a whole grapheme', () => {
		const onEmoji = StringUtils.onChar('😀');
		const hits: Array<[number, number]> = [];
		onEmoji('a😀b', (index, size) => hits.push([index, size]));
		expect(hits).toEqual([[1, 2]]);
	});

	it('does not match characters outside the target set', () => {
		const onVowel = StringUtils.onChar('aeiou');
		const hits: number[] = [];
		onVowel('xyz', (index) => hits.push(index));
		expect(hits).toEqual([]);
	});
});

describe('StringUtils.lookupArray / lookupArray128', () => {
	it('lookupArray marks the code point of every given char as 1', () => {
		const lookup = StringUtils.lookupArray('ac');
		expect(lookup['a'.charCodeAt(0)]).toBe(1);
		expect(lookup['c'.charCodeAt(0)]).toBe(1);
		expect(lookup['b'.charCodeAt(0)]).toBe(0);
	});

	it('lookupArray sizes itself to the highest code point given', () => {
		const lookup = StringUtils.lookupArray('a');
		expect(lookup.length).toBe('a'.charCodeAt(0) + 1);
	});

	it('lookupArray128 is always exactly 128 entries', () => {
		expect(StringUtils.lookupArray128('a').length).toBe(128);
	});
});

describe('StringUtils.slugify', () => {
	it('lowercases, strips accents, and replaces spaces with dashes', () => {
		expect(StringUtils.slugify('Café com Leite')).toBe('cafe-com-leite');
	});

	it('collapses repeated separators', () => {
		expect(StringUtils.slugify('a   b--c')).toBe('a-b-c');
	});

	it('strips characters outside [a-z0-9 -]', () => {
		expect(StringUtils.slugify('Hello, World!')).toBe('hello-world');
	});
});

describe('StringUtils.truncate', () => {
	it('returns the text unchanged when within the limit', () => {
		expect(StringUtils.truncate('hello', 10)).toBe('hello');
	});

	it('truncates at a word boundary by default', () => {
		expect(StringUtils.truncate('hello wonderful world', 8)).toBe('hello...');
	});

	it('truncates at the exact length when preserveWords is false', () => {
		expect(StringUtils.truncate('hello world', 5, false)).toBe('hello...');
	});
});

describe('StringUtils.capitalizeWords', () => {
	it('capitalizes the first letter of every word', () => {
		expect(StringUtils.capitalizeWords('hello wonderful world')).toBe('Hello Wonderful World');
	});
});

describe('StringUtils.toSnakeCase', () => {
	it('converts camelCase to snake_case', () => {
		expect(StringUtils.toSnakeCase('helloWorld')).toBe('hello_world');
	});

	it('converts kebab-case and spaces to underscores', () => {
		expect(StringUtils.toSnakeCase('hello-world foo')).toBe('hello_world_foo');
	});
});
