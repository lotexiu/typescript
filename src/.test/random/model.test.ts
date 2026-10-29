import { describe, expect, it } from 'vitest';
import { Random } from '@ts/random/model';
import type { TRandomState } from '@ts/random/types';
import vectors from '../../../vectors/random.json';

describe('Random — vetores de referência (xoshiro128** + splitmix32, calculados fora do TypeScript)', () => {
	for (const vector of vectors.xoshiro) {
		it(`semente ${JSON.stringify(vector.seed)}`, () => {
			const random = new Random(vector.seed);
			expect(vector.uint32.map(() => random.nextUint32())).toEqual(vector.uint32);
		});
	}

	it('dado de 6 faces, semente 42', () => {
		const random = new Random(42);
		expect(vectors.dice42.map(() => random.int(1, 6))).toEqual(vectors.dice42);
	});

	it('shuffle, semente 7', () => {
		expect(new Random(7).shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toEqual(vectors.shuffle7);
	});

	it('bytes', () => {
		expect([...new Random(1).bytes(16)]).toEqual(vectors.bytes1);
	});

	it('estado salvo continua a mesma sequência', () => {
		const random = new Random(vectors.state.seed);
		for (let i = 0; i < 5; i++) random.nextUint32();
		expect(random.state()).toEqual(vectors.state.after5);
		const restored = Random.fromState(random.state() as TRandomState);
		expect([restored.nextUint32(), restored.nextUint32(), restored.nextUint32()]).toEqual(vectors.state.next3);
	});
});

describe('Random — comportamento', () => {
	it('clone é independente', () => {
		const original = new Random(5);
		const copy = original.clone();
		original.nextUint32();
		expect(copy.nextUint32()).not.toBe(original.nextUint32());
	});

	it('uniform fica em [0, 1)', () => {
		const random = new Random(1);
		for (let i = 0; i < 2000; i++) {
			const value = random.uniform();
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThan(1);
		}
	});

	it('int é inclusivo nos dois lados e cobre todos os valores', () => {
		const random = new Random(3);
		const seen = new Set<number>();
		for (let i = 0; i < 500; i++) seen.add(random.int(-2, 2));
		expect([...seen].sort((left, right) => left - right)).toEqual([-2, -1, 0, 1, 2]);
		expect(random.int(4, 4)).toBe(4);
	});

	it('int recusa intervalo inválido', () => {
		const random = new Random(1);
		expect(() => random.int(5, 1)).toThrow(RangeError);
		expect(() => random.int(0.5, 2)).toThrow(RangeError);
		expect(() => random.int(0, 2 ** 32)).toThrow(RangeError);
	});

	it('shuffle não altera a entrada e preserva os itens', () => {
		const input = [1, 2, 3, 4, 5];
		const out = new Random(9).shuffle(input);
		expect(input).toEqual([1, 2, 3, 4, 5]);
		expect([...out].sort()).toEqual(input);
	});

	it('pick de lista vazia é undefined', () => {
		expect(new Random(1).pick([])).toBeUndefined();
		expect(new Random(1).pick(['só'])).toBe('só');
	});

	it('weighted respeita os pesos (e ignora peso ≤ 0)', () => {
		const random = new Random(11);
		const counts: Record<string, number> = { a: 0, b: 0, c: 0 };
		for (let i = 0; i < 4000; i++) counts[random.weighted([{ value: 'a', weight: 1 }, { value: 'b', weight: 3 }, { value: 'c', weight: 0 }])!]++;
		expect(counts.c).toBe(0);
		expect(counts.b / counts.a).toBeGreaterThan(2.4);
		expect(counts.b / counts.a).toBeLessThan(3.6);
		expect(random.weighted([{ value: 'x', weight: 0 }])).toBeUndefined();
	});

	it('normal tem a média e o desvio pedidos', () => {
		const random = new Random(2);
		const values = Array.from({ length: 6000 }, () => random.normal(10, 2));
		const mean = values.reduce((total, sample) => total + sample, 0) / values.length;
		const deviation = Math.sqrt(values.reduce((total, sample) => total + (sample - mean) ** 2, 0) / values.length);
		expect(mean).toBeCloseTo(10, 0);
		expect(deviation).toBeGreaterThan(1.85);
		expect(deviation).toBeLessThan(2.15);
	});

	it('estado inválido é recusado', () => {
		expect(() => new Random(1).setState([1, 2, 3] as unknown as TRandomState)).toThrow(RangeError);
	});
});
