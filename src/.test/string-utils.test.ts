import { describe, expect, it } from 'vitest';
import { StringUtils } from '@tsn-string/utils';

describe('StringUtils formatting', () => {
	it('toKebabCase converts PascalCase/camelCase', () => {
		expect(StringUtils.toKebabCase('MyComponentName')).toBe('my-component-name');
	});

	it('capitalize/capitalizeAll', () => {
		expect(StringUtils.capitalize('hello')).toBe('Hello');
		expect(StringUtils.capitalizeAll('hello world', ' ')).toBe('Hello World');
	});

	it('leftPad/rightPad', () => {
		expect(StringUtils.leftPad('5', '0', 3)).toBe('005');
		expect(StringUtils.rightPad('5', '0', 3)).toBe('500');
	});

	it('removeCharacters strips every listed character', () => {
		expect(StringUtils.removeCharacters('a-b-c', '-')).toBe('abc');
	});

	it('noAccent strips diacritics', () => {
		expect(StringUtils.noAccent('café com açúcar')).toBe('cafe com acucar');
	});

	it('getFirstDifferentIndex/getLastDifferentIndex', () => {
		expect(StringUtils.getFirstDifferentIndex('abcde', 'abXde')).toBe(2);
		expect(StringUtils.getLastDifferentIndex('abcde', 'abXde')).toBe(2);
		expect(StringUtils.getFirstDifferentIndex('abc', 'abc')).toBe(-1);
	});

	it('stringToCharCodeArray returns hex char codes', () => {
		expect(StringUtils.stringToCharCodeArray('AB')).toEqual(['41', '42']);
	});
});

describe('StringUtils character classification', () => {
	it('isLetter/isDigit/isLetterOrDigit', () => {
		expect(StringUtils.isLetter('a')).toBe(true);
		expect(StringUtils.isLetter('1')).toBe(false);
		expect(StringUtils.isDigit('7')).toBe(true);
		expect(StringUtils.isLetterOrDigit('7')).toBe(true);
		expect(StringUtils.isLetterOrDigit('!')).toBe(false);
	});

	it('isUpperCase/isLowerCase', () => {
		expect(StringUtils.isUpperCase('A')).toBe(true);
		expect(StringUtils.isUpperCase('a')).toBe(false);
		expect(StringUtils.isLowerCase('a')).toBe(true);
	});

	it('isIdentifier accepts letters, digits, _ and $', () => {
		expect(StringUtils.isIdentifier('_')).toBe(true);
		expect(StringUtils.isIdentifier('$')).toBe(true);
		expect(StringUtils.isIdentifier('a')).toBe(true);
		expect(StringUtils.isIdentifier('-')).toBe(false);
	});

	it('isHexadecimal accepts 0-9 and a-f case-insensitively', () => {
		expect(StringUtils.isHexadecimal('9')).toBe(true);
		expect(StringUtils.isHexadecimal('f')).toBe(true);
		expect(StringUtils.isHexadecimal('F')).toBe(true);
		expect(StringUtils.isHexadecimal('g')).toBe(false);
	});

	it('whitespace/line-break family', () => {
		expect(StringUtils.isWhitespace(' ')).toBe(true);
		expect(StringUtils.isTab('\t')).toBe(true);
		expect(StringUtils.isCarriageReturn('\r')).toBe(true);
		expect(StringUtils.isLineBreak('\n')).toBe(true);
		expect(StringUtils.isLineBreak('\r')).toBe(true);
		expect(StringUtils.isFormFeed('\f')).toBe(true);
		expect(StringUtils.isVerticalTab('\v')).toBe(true);
		expect(StringUtils.isFormatting(' ')).toBe(true);
		expect(StringUtils.isFormatting('a')).toBe(false);
	});

	it('operator/punctuation/symbol classification', () => {
		expect(StringUtils.isMathOperator('+')).toBe(true);
		expect(StringUtils.isRelationalOperator('=')).toBe(true);
		expect(StringUtils.isBitwireOperator('&')).toBe(true);
		expect(StringUtils.isPunctuation('.')).toBe(true);
		expect(StringUtils.isEscape('\\')).toBe(true);
		expect(StringUtils.isSymbol('+')).toBe(true);
		expect(StringUtils.isSymbol('a')).toBe(false);
	});
});
