import { describe, it, expect } from 'vitest';
import { MaskCompiledPattern } from '@ts/mask/compiled-pattern/model';
import { TMaskStaticToken, TMaskRuleToken } from '@ts/mask/token/model';

describe('MaskCompiledPattern', () => {
	it('exposes its constructor fields', () => {
		const tokens = [new TMaskStaticToken('-')];
		const pattern = new MaskCompiledPattern('-', tokens, [], tokens as any, '');
		expect(pattern.source).toBe('-');
		expect(pattern.tokens).toBe(tokens);
	});

	it('validWithMask requires every literal and rule token in sequence', () => {
		const staticToken = new TMaskStaticToken('-');
		const ruleToken = new TMaskRuleToken('[0-9]', 2, 2);
		const pattern = new MaskCompiledPattern('0{2}-', [ruleToken, staticToken], [ruleToken], [staticToken], '');
		expect(pattern.validWithMask().test('12-')).toBe(true);
		expect(pattern.validWithMask().test('12')).toBe(false); // missing literal
		expect(pattern.validWithMask().test('1-')).toBe(false); // too few digits
	});

	// Regression: a rule token whose value has multiple alternatives (e.g. digits OR letters)
	// used to produce `alt1|alt2{min,max}` without a grouping `(?:...)`, so the quantifier bound
	// only to the last alternative instead of the whole group — breaking both length checks and
	// exact-length matching for any multi-alternative rule.
	it('validWithMask correctly quantifies a multi-alternative rule token as a whole', () => {
		const ruleToken = new TMaskRuleToken('[0-9]|[a-z]', 3, 3);
		const pattern = new MaskCompiledPattern('A{3}', [ruleToken], [ruleToken], [], '');
		expect(pattern.validWithMask().test('a1b')).toBe(true);
		expect(pattern.validWithMask().test('5')).toBe(false);
		expect(pattern.validWithMask().test('abcde')).toBe(false);
	});

	it('validWithoutMask ignores static/literal tokens entirely', () => {
		const staticToken = new TMaskStaticToken('-');
		const ruleToken = new TMaskRuleToken('[0-9]', 2, 2);
		const pattern = new MaskCompiledPattern('0{2}-', [ruleToken, staticToken], [ruleToken], [staticToken], '');
		expect(pattern.validWithoutMask().test('12')).toBe(true);
		expect(pattern.validWithoutMask().test('12-')).toBe(false);
	});

	it('validWithMask/validWithoutMask are created lazily and cached', () => {
		const ruleToken = new TMaskRuleToken('[0-9]', 1, 1);
		const pattern = new MaskCompiledPattern('0', [ruleToken], [ruleToken], [], '');
		expect(pattern.validWithMask()).toBe(pattern.validWithMask());
	});
});
