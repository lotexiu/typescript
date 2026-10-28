import { describe, expect, it } from 'vitest';
import { Duration } from '@ts/plain/duration/model';
import type { TDurationParts } from '@ts/plain/types';
import vectors from '../../../../vectors/plain.json';

describe('Duration', () => {
	for (const v of vectors.duration) {
		it(`${JSON.stringify(v.parts)} ↔ ${v.iso}`, () => {
			const duration = Duration.from(v.parts as TDurationParts);
			expect(duration.toMilliseconds()).toBe(v.ms);
			expect(duration.toString()).toBe(v.iso);
			expect(Duration.parse(v.iso).toMilliseconds()).toBe(v.ms);
		});
	}

	for (const text of vectors['invalid-durations']) {
		it(`recusa ${JSON.stringify(text)}`, () => {
			expect(Duration.tryParse(text)).toBeUndefined();
			expect(() => Duration.parse(text)).toThrow(RangeError);
		});
	}

	it('componentes são do valor absoluto; o sinal vem à parte', () => {
		const d = Duration.from({ hours: -1, minutes: -5 });
		expect(d.sign).toBe(-1);
		expect([d.hours, d.minutes]).toEqual([1, 5]);
		expect(d.abs().toString()).toBe('PT1H5M');
	});

	it('total em qualquer unidade', () => {
		expect(Duration.from({ minutes: 90 }).total('hours')).toBe(1.5);
		expect(Duration.from('P1D').total('minutes')).toBe(1440);
	});

	it('soma, subtração, comparação e igualdade', () => {
		const a = Duration.from({ minutes: 50 });
		expect(a.add({ minutes: 20 }).toString()).toBe('PT1H10M');
		expect(a.subtract('PT1H').toString()).toBe('-PT10M');
		expect(Duration.compare(a, Duration.from('PT51M'))).toBe(-1);
		expect(a.equals(Duration.from({ seconds: 3000 }))).toBe(true);
	});

	it('rejeita não finitos', () => {
		expect(() => Duration.from({ hours: Number.NaN })).toThrow(RangeError);
		expect(() => Duration.fromMilliseconds(Infinity)).toThrow(RangeError);
	});

	it('serializa como ISO em JSON', () => {
		expect(JSON.stringify({ d: Duration.from({ minutes: 5 }) })).toBe('{"d":"PT5M"}');
	});
});
