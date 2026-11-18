import { describe, it, expect } from 'vitest';
import { TMaskStaticToken, TMaskRuleToken } from '@ts/mask/token/model';

describe('TMaskStaticToken', () => {
	it('holds a literal value', () => {
		expect(new TMaskStaticToken('-').value).toBe('-');
	});
});

describe('TMaskRuleToken', () => {
	it('exposes value/min/max/flags as given', () => {
		const token = new TMaskRuleToken('[0-9]', 1, 3, 'g');
		expect(token.value).toBe('[0-9]');
		expect(token.min).toBe(1);
		expect(token.max).toBe(3);
		expect(token.flags).toBe('g');
	});

	it('match is a regex testing a single character against the rule value', () => {
		const token = new TMaskRuleToken('[0-9]', 1, 3);
		expect(token.match().test('5')).toBe(true);
		expect(token.match().test('a')).toBe(false);
	});

	it('match wraps a multi-alternative value so the whole thing is anchored', () => {
		const token = new TMaskRuleToken('[0-9]|[a-z]', 1, 1);
		expect(token.match().test('5')).toBe(true);
		expect(token.match().test('a')).toBe(true);
		expect(token.match().test('!')).toBe(false);
	});

	it('match is created lazily, reading `this.value`/`this.flags` correctly even though it is a field initializer', () => {
		const token = new TMaskRuleToken('[a-z]', 1, 1, 'i');
		expect(token.match().test('A')).toBe(true); // 'i' flag applied
	});
});
