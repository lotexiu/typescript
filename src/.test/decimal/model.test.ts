import { describe, expect, it } from 'vitest';
import { Decimal } from '@ts/decimal/model';
import type { TRoundingMode } from '@ts/decimal/types';
import vectors from '../../../vectors/decimal.json';

/** O Decimal não tem zero negativo (`-0.00` do Python vira `0.00`). */
const noNegativeZero = (text: string) => text.replace(/^-(0(\.0+)?)$/, '$1');

describe('Decimal — vetores (referência: decimal do Python)', () => {
	for (const vector of vectors.parse) it(`parse ${vector.text} → ${vector.string}`, () => expect(Decimal.parse(vector.text).toString()).toBe(vector.string));

	for (const vector of vectors.ops) {
		it(`${vector.a} e ${vector.b}: soma, subtração, produto e comparação`, () => {
			const left = Decimal.parse(vector.a);
			expect(left.add(vector.b).toString()).toBe(vector.add);
			expect(left.subtract(vector.b).toString()).toBe(vector.sub);
			expect(left.multiply(vector.b).toString()).toBe(vector.mul);
			expect(Decimal.compare(left, vector.b)).toBe(vector.cmp);
		});
	}

	for (const vector of vectors.round) it(`${vector.value} → ${vector.scale} casas (${vector.mode}) = ${vector.result}`, () => expect(Decimal.parse(vector.value).toScale(vector.scale, vector.mode as TRoundingMode).toString()).toBe(noNegativeZero(vector.result)));

	for (const vector of vectors.divide) it(`${vector.a} / ${vector.b} → ${vector.scale} casas (${vector.mode}) = ${vector.result}`, () => expect(Decimal.parse(vector.a).divide(vector.b, vector.scale, vector.mode as TRoundingMode).toString()).toBe(noNegativeZero(vector.result)));
});

describe('Decimal — comportamento', () => {
	it('0.1 + 0.2 é exatamente 0.3 (o ponto flutuante erra)', () => {
		expect(0.1 + 0.2).not.toBe(0.3);
		expect(Decimal.from(0.1).add(0.2).equals('0.3')).toBe(true);
	});

	it('preserva a escala; equals compara o valor', () => {
		expect(Decimal.parse('1.50').toString()).toBe('1.50');
		expect(Decimal.parse('1.50').equals('1.5')).toBe(true);
		expect(Decimal.parse('1.500').strip().toString()).toBe('1.5');
		expect(Decimal.parse('100').strip().toString()).toBe('100');
	});

	it('tryParse recusa o que não é decimal', () => {
		for (const text of ['', 'abc', '1,5', '1.', '--1', '1e', '1e99999']) expect(Decimal.tryParse(text)).toBeUndefined();
		expect(() => Decimal.parse('1,5')).toThrow(RangeError);
		expect(() => Decimal.from(NaN)).toThrow(RangeError);
		expect(() => Decimal.from(Infinity)).toThrow(RangeError);
	});

	it('unidades menores (centavos)', () => {
		expect(Decimal.fromMinor(1999n, 2).toString()).toBe('19.99');
		expect(Decimal.parse('19.99').toMinor(2)).toBe(1999n);
		expect(Decimal.parse('19.995').toMinor(2)).toBe(2000n);
		expect(Decimal.parse('19.995').toMinor(2, 'down')).toBe(1999n);
		expect(Decimal.parse('5').toMinor(2)).toBe(500n);
		expect(Decimal.fromMinor(-5n, 2).toString()).toBe('-0.05');
	});

	it('divisão por zero e escala inválida', () => {
		expect(() => Decimal.parse('1').divide('0', 2)).toThrow(RangeError);
		expect(() => Decimal.parse('1').divide(3, -1)).toThrow(RangeError);
	});

	it('remainder, pow, abs, sign, sum', () => {
		expect(Decimal.parse('7.5').remainder('2').toString()).toBe('1.5');
		expect(Decimal.parse('-7.5').remainder('2').toString()).toBe('-1.5');
		expect(Decimal.parse('1.1').pow(2).toString()).toBe('1.21');
		expect(Decimal.parse('-2').abs().toString()).toBe('2');
		expect(Decimal.parse('-2').sign).toBe(-1);
		expect(Decimal.parse('0.00').sign).toBe(0);
		expect(Decimal.sum(['0.1', 0.2, 1n]).toString()).toBe('1.3');
	});

	it('allocate reparte sem perder centavos', () => {
		const parts = Decimal.allocate('100.00', [1, 1, 1], 2);
		expect(parts.map(String)).toEqual(['33.34', '33.33', '33.33']);
		expect(Decimal.sum(parts).toString()).toBe('100.00');
		expect(Decimal.allocate('0.05', [3, 7], 2).map(String)).toEqual(['0.02', '0.03']);
		expect(Decimal.allocate('-10.00', [1, 1, 1], 2).map(String)).toEqual(['-3.34', '-3.33', '-3.33']);
		expect(Decimal.allocate('10', ['0.5', '0.5'], 0).map(String)).toEqual(['5', '5']);
		expect(() => Decimal.allocate('1', [0, 0], 2)).toThrow(RangeError);
		expect(() => Decimal.allocate('1', [], 2)).toThrow(RangeError);
	});

	it('toFixed e JSON', () => {
		expect(Decimal.parse('2.345').toFixed(2)).toBe('2.35');
		expect(Decimal.parse('2.345').toFixed(2, 'half-even')).toBe('2.34');
		expect(JSON.stringify({ price: Decimal.parse('9.90') })).toBe('{"price":"9.90"}');
		expect(Decimal.parse('12.5').toNumber()).toBe(12.5);
	});

	it('números grandes continuam exatos', () => {
		const big = Decimal.parse('99999999999999999999.99');
		expect(big.add('0.01').toString()).toBe('100000000000000000000.00');
	});
});
