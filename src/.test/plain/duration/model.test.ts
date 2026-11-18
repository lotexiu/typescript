import { describe, expect, it } from 'vitest';
import { Duration } from '@ts/plain/duration/model';
import type { TDurationParts } from '@ts/plain/types';
import vectors from '../../../../vectors/plain.json';

describe('Duration', () => {
	for (const vector of vectors.duration) {
		it(`${JSON.stringify(vector.parts)} ↔ ${vector.iso}`, () => {
			const duration = Duration.from(vector.parts as TDurationParts);
			expect(duration.toMilliseconds()).toBe(vector.ms);
			expect(duration.toString()).toBe(vector.iso);
			expect(Duration.parse(vector.iso).toMilliseconds()).toBe(vector.ms);
		});
	}

	for (const text of vectors['invalid-durations']) {
		it(`recusa ${JSON.stringify(text)}`, () => {
			expect(Duration.tryParse(text)).toBeUndefined();
			expect(() => Duration.parse(text)).toThrow(RangeError);
		});
	}

	it('componentes são do valor absoluto; o sinal vem à parte', () => {
		const duration = Duration.from({ hours: -1, minutes: -5 });
		expect(duration.sign).toBe(-1);
		expect([duration.hours, duration.minutes]).toEqual([1, 5]);
		expect(duration.abs().toString()).toBe('PT1H5M');
	});

	it('total em qualquer unidade', () => {
		expect(Duration.from({ minutes: 90 }).total('hours')).toBe(1.5);
		expect(Duration.from('P1D').total('minutes')).toBe(1440);
	});

	it('soma, subtração, comparação e igualdade', () => {
		const duration = Duration.from({ minutes: 50 });
		expect(duration.add({ minutes: 20 }).toString()).toBe('PT1H10M');
		expect(duration.subtract('PT1H').toString()).toBe('-PT10M');
		expect(Duration.compare(duration, Duration.from('PT51M'))).toBe(-1);
		expect(duration.equals(Duration.from({ seconds: 3000 }))).toBe(true);
	});

	it('rejeita não finitos', () => {
		expect(() => Duration.from({ hours: Number.NaN })).toThrow(RangeError);
		expect(() => Duration.fromMilliseconds(Infinity)).toThrow(RangeError);
	});

	it('serializa como ISO em JSON', () => {
		expect(JSON.stringify({ d: Duration.from({ minutes: 5 }) })).toBe('{"d":"PT5M"}');
	});
});
