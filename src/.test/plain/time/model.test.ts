import { describe, expect, it } from 'vitest';
import { PlainTime } from '@ts/plain/time/model';
import vectors from '../../../../vectors/plain.json';

describe('PlainTime', () => {
	it('parse e toString', () => {
		expect(PlainTime.parse('09:05').toString()).toBe('09:05:00');
		expect(PlainTime.parse('23:59:59.5').toString()).toBe('23:59:59.5');
		expect(PlainTime.parse('00:00:00.250').millisecond).toBe(250);
	});

	it('recusa horas que não existem', () => {
		for (const text of ['24:00', '12:60', '12:30:60', '9:30', '12', '12:30:00.', 'ab:cd']) expect(PlainTime.tryParse(text)).toBeUndefined();
		expect(() => PlainTime.from({ hour: 25 })).toThrow(RangeError);
	});

	it('passar de 24h dá a volta (e voltar de 00:00 também)', () => {
		expect(PlainTime.parse('23:30').add({ hours: 1 }).toString()).toBe('00:30:00');
		expect(PlainTime.parse('00:10').subtract({ minutes: 20 }).toString()).toBe('23:50:00');
		expect(PlainTime.parse('12:00').add({ days: 3 }).toString()).toBe('12:00:00');
	});

	it('until não dá a volta e pode ser negativo', () => {
		expect(PlainTime.parse('09:00').until(PlainTime.parse('17:30')).toString()).toBe('PT8H30M');
		expect(PlainTime.parse('17:30').until(PlainTime.parse('09:00')).toString()).toBe('-PT8H30M');
	});

	it('fromMilliseconds e compare', () => {
		expect(PlainTime.fromMilliseconds(86_400_000 + 3_600_000).toString()).toBe('01:00:00');
		expect(PlainTime.compare(PlainTime.parse('08:00'), PlainTime.parse('08:00:00.001'))).toBe(-1);
	});
});
