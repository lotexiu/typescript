import { describe, it, expect } from 'vitest';
import { RegexUtils } from '@tsn/regex/utils';

describe('RegexUtils.escapeReservedKeys', () => {
	it('escapes every regex-reserved character', () => {
		expect(RegexUtils.escapeReservedKeys('a.b*c?')).toBe('a\\.b\\*c\\?');
	});

	it('leaves plain text untouched', () => {
		expect(RegexUtils.escapeReservedKeys('hello world')).toBe('hello world');
	});

	it('produces a string safely usable inside a new RegExp', () => {
		const raw = '1 + 1 = 2?';
		const escaped = RegexUtils.escapeReservedKeys(raw);
		const re = new RegExp(escaped);
		expect(re.test(raw)).toBe(true);
	});

	it('escapes brackets used to build character classes', () => {
		expect(RegexUtils.escapeReservedKeys('[a-z]')).toBe('\\[a-z\\]');
	});
});

describe('RegexUtils.hasAstralChar', () => {
	it('is false for plain ASCII/BMP text', () => {
		expect(RegexUtils.hasAstralChar('hello')).toBe(false);
		expect(RegexUtils.hasAstralChar('café')).toBe(false);
		expect(RegexUtils.hasAstralChar('中文')).toBe(false);
	});

	it('is true for a surrogate-pair emoji', () => {
		expect(RegexUtils.hasAstralChar('😀')).toBe(true);
	});

	it('is true for a ZWJ sequence (contains surrogate pairs)', () => {
		expect(RegexUtils.hasAstralChar('👨‍👩‍👧')).toBe(true);
	});

	it('is true for a flag emoji', () => {
		expect(RegexUtils.hasAstralChar('🇧🇷')).toBe(true);
	});

	it('is false for an empty string', () => {
		expect(RegexUtils.hasAstralChar('')).toBe(false);
	});
});

describe('RegexUtils.patterns', () => {
	it('exposes the DATE.ISO pattern matching yyyy-mm-dd / yyyy/mm/dd', () => {
		const re = new RegExp(`^${RegexUtils.patterns.DATE.ISO}$`);
		expect(re.test('2024-06-15')).toBe(true);
		expect(re.test('2024/06/15')).toBe(true);
	});

	it('DATE.ISO rejects mismatched separators via the backreference', () => {
		const re = new RegExp(`^${RegexUtils.patterns.DATE.ISO}$`);
		expect(re.test('2024-06/15')).toBe(false);
	});
});
