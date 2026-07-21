import { describe, expect, it } from 'vitest';
import { ValidationUtils } from '@tsn-validation/utils';

describe('ValidationUtils.required', () => {
	it('is false for undefined, null and empty string', () => {
		expect(ValidationUtils.required(undefined)).toBe(false);
		expect(ValidationUtils.required(null)).toBe(false);
		expect(ValidationUtils.required('')).toBe(false);
	});

	it('is true for any other value, including 0 and false', () => {
		expect(ValidationUtils.required(0)).toBe(true);
		expect(ValidationUtils.required(false)).toBe(true);
		expect(ValidationUtils.required('a')).toBe(true);
	});
});

describe('ValidationUtils.pattern', () => {
	it('checks a value against a regex', () => {
		expect(ValidationUtils.pattern('123', /^\d+$/)).toBe(true);
		expect(ValidationUtils.pattern('12a', /^\d+$/)).toBe(false);
	});
});

describe('ValidationUtils.isValidCPF', () => {
	it('accepts a known-valid CPF, with or without mask', () => {
		expect(ValidationUtils.isValidCPF('111.444.777-35')).toBe(true);
		expect(ValidationUtils.isValidCPF('11144477735')).toBe(true);
	});

	it('rejects wrong check digits, wrong length and repeated-digit sequences', () => {
		expect(ValidationUtils.isValidCPF('111.444.777-30')).toBe(false);
		expect(ValidationUtils.isValidCPF('123')).toBe(false);
		expect(ValidationUtils.isValidCPF('111.111.111-11')).toBe(false);
	});
});

describe('ValidationUtils.isValidCNPJ', () => {
	it('accepts a known-valid CNPJ, with or without mask', () => {
		expect(ValidationUtils.isValidCNPJ('11.222.333/0001-81')).toBe(true);
		expect(ValidationUtils.isValidCNPJ('11222333000181')).toBe(true);
	});

	it('rejects wrong check digits, wrong length and repeated-digit sequences', () => {
		expect(ValidationUtils.isValidCNPJ('11.222.333/0001-80')).toBe(false);
		expect(ValidationUtils.isValidCNPJ('123')).toBe(false);
		expect(ValidationUtils.isValidCNPJ('11.111.111/1111-11')).toBe(false);
	});
});
