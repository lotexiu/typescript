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
		const regex = new RegExp(escaped);
		expect(regex.test(raw)).toBe(true);
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
		const regex = new RegExp(`^${RegexUtils.patterns.DATE.ISO}$`);
		expect(regex.test('2024-06-15')).toBe(true);
		expect(regex.test('2024/06/15')).toBe(true);
	});

	it('DATE.ISO rejects mismatched separators via the backreference', () => {
		const regex = new RegExp(`^${RegexUtils.patterns.DATE.ISO}$`);
		expect(regex.test('2024-06/15')).toBe(false);
	});
});

describe('RegexUtils — validações e limpezas numéricas', () => {
	it('isUuid', () => {
		expect(RegexUtils.isUuid('123e4567-e89b-42d3-a456-426614174000')).toBe(true);
		expect(RegexUtils.isUuid('123E4567-E89B-42D3-A456-426614174000')).toBe(true);
		expect(RegexUtils.isUuid('123e4567-e89b-92d3-a456-426614174000')).toBe(false);
		expect(RegexUtils.isUuid('123e4567e89b42d3a456426614174000')).toBe(false);
	});

	it('isDigits', () => {
		expect(RegexUtils.isDigits('0123')).toBe(true);
		expect(RegexUtils.isDigits('')).toBe(false);
		expect(RegexUtils.isDigits('12a')).toBe(false);
		expect(RegexUtils.isDigits('1\n')).toBe(false);
	});

	it('stripNonDigits (chamadas repetidas dão o mesmo resultado: sem estado no regex global)', () => {
		expect(RegexUtils.stripNonDigits('(11) 9-8765')).toBe('1198765');
		expect(RegexUtils.stripNonDigits('(11) 9-8765')).toBe('1198765');
		expect(RegexUtils.stripNonDigits('abc')).toBe('');
	});

	it('trimLeadingZeros deixa sempre um dígito', () => {
		expect(RegexUtils.trimLeadingZeros('0042')).toBe('42');
		expect(RegexUtils.trimLeadingZeros('000')).toBe('0');
		expect(RegexUtils.trimLeadingZeros('0')).toBe('0');
		expect(RegexUtils.trimLeadingZeros('1050')).toBe('1050');
	});

	it('trimTrailingZeros', () => {
		expect(RegexUtils.trimTrailingZeros('250')).toBe('25');
		expect(RegexUtils.trimTrailingZeros('000')).toBe('');
		expect(RegexUtils.trimTrailingZeros('105')).toBe('105');
	});
});
