import { describe, it, expect } from 'vitest';
import { ChecksumUtils } from '@ts/checksum/utils';
import type { TWeightedSpec } from '@ts/checksum/types';
import vectors from '../../../vectors/checksum.json';

describe('ChecksumUtils.digit (vetores compartilhados)', () => {
	for (const vector of vectors.weighted) {
		it(vector.name, () => {
			expect(ChecksumUtils.digit(vector.text, vector.spec as TWeightedSpec)).toBe(vector.digit ?? undefined);
		});
	}
});

type TLuhnVector = { full?: string; valid?: boolean; body?: string; digit?: number };

describe('ChecksumUtils.luhn', () => {
	for (const vector of vectors.luhn as TLuhnVector[]) {
		if (vector.full !== undefined) it(`luhnValid(${vector.full}) = ${vector.valid}`, () => expect(ChecksumUtils.luhnValid(vector.full!)).toBe(vector.valid));
		else it(`luhnDigit(${vector.body}) = ${vector.digit}`, () => expect(ChecksumUtils.luhnDigit(vector.body!)).toBe(vector.digit));
	}

	it('texto com letra não é válido', () => {
		expect(ChecksumUtils.luhnValid('4111a11111111111')).toBe(false);
		expect(ChecksumUtils.luhnDigit('12x')).toBeUndefined();
	});
});

describe('ChecksumUtils.mod97', () => {
	for (const vector of vectors.mod97) it(vector.note, () => expect(ChecksumUtils.mod97(vector.text)).toBe(vector.remainder));

	it('IBAN com um dígito trocado deixa de dar 1', () => {
		expect(ChecksumUtils.mod97('WEST12345698765433GB82')).not.toBe(1);
	});

	it('caractere inválido -> indefinido', () => {
		expect(ChecksumUtils.mod97('AB-12')).toBeUndefined();
	});
});

describe('ChecksumUtils auxiliares', () => {
	it('cyclicWeights conta da direita (2..9)', () => {
		expect(ChecksumUtils.cyclicWeights(10, 2, 9)).toEqual([3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
		expect(ChecksumUtils.cyclicWeights(3, 2, 9)).toEqual([4, 3, 2]);
	});

	it('regras de dígito', () => {
		expect(ChecksumUtils.applyRule(0, 11, 'complement-zero-below-2')).toBe(0);
		expect(ChecksumUtils.applyRule(1, 11, 'complement-zero-below-2')).toBe(0);
		expect(ChecksumUtils.applyRule(5, 11, 'complement-zero-below-2')).toBe(6);
		expect(ChecksumUtils.applyRule(10, 11, 'remainder-zero-above-9')).toBe(0);
		expect(ChecksumUtils.applyRule(7, 10, 'complement')).toBe(3);
		expect(ChecksumUtils.applyRule(0, 10, 'complement')).toBe(0);
		expect(ChecksumUtils.applyRule(4, 11, 'remainder')).toBe(4);
	});

	it('charValue: digit só aceita 0-9; ascii-48 aceita letras maiúsculas (A=17)', () => {
		expect(ChecksumUtils.charValue('7')).toBe(7);
		expect(ChecksumUtils.charValue('A')).toBeUndefined();
		expect(ChecksumUtils.charValue('A', 'ascii-48')).toBe(17);
		expect(ChecksumUtils.charValue('Z', 'ascii-48')).toBe(42);
		expect(ChecksumUtils.charValue('ab', 'ascii-48')).toBeUndefined();
	});

	it('allSame e digitSum', () => {
		expect(ChecksumUtils.allSame('11111111111')).toBe(true);
		expect(ChecksumUtils.allSame('11111111112')).toBe(false);
		expect(ChecksumUtils.allSame('1')).toBe(false);
		expect(ChecksumUtils.digitSum(18)).toBe(9);
	});

	it('sumProductDigits soma os algarismos de cada produto (estilo IE-MG)', () => {
		const spec: TWeightedSpec = { weights: [1, 2, 1, 2], modulus: 10, rule: 'complement', sumProductDigits: true };
		// 9*1 + 9*2(=18→9) + 9*1 + 9*2(=18→9) = 36 → resto 6 → 10-6 = 4
		expect(ChecksumUtils.digit('9999', spec)).toBe(4);
	});
});
