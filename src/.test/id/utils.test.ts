import { describe, expect, it } from 'vitest';
import { IdUtils } from '@ts/id/utils';
import { Random } from '@ts/random/model';
import vectors from '../../../vectors/random.json';

describe('IdUtils.uuid', () => {
	for (const vector of vectors.uuid) {
		it(`bytes ${vector.bytes.slice(0, 3).join(',')}… → ${vector.uuid}`, () => {
			expect(IdUtils.uuid(Uint8Array.from(vector.bytes))).toBe(vector.uuid);
		});
	}

	it('o padrão usa crypto e gera v4 válido e único', () => {
		const ids = new Set(Array.from({ length: 200 }, () => IdUtils.uuid()));
		expect(ids.size).toBe(200);
		for (const id of ids) expect(IdUtils.isUuid(id)).toBe(true);
	});

	it('recusa tamanho errado; isUuid recusa lixo', () => {
		expect(() => IdUtils.uuid(new Uint8Array(15))).toThrow(RangeError);
		expect(IdUtils.isUuid('não é uuid')).toBe(false);
	});

	it('com Random.bytes é reproduzível', () => {
		expect(IdUtils.uuid(new Random(8).bytes(16))).toBe(IdUtils.uuid(new Random(8).bytes(16)));
	});
});

describe('IdUtils.short', () => {
	for (const vector of vectors.short) {
		it(`alfabeto ${vector.alphabet.length} símbolos, ${vector.size} chars`, () => {
			const random = new Random(vector.seed);
			expect(IdUtils.short({ alphabet: vector.alphabet, size: vector.size, bytes: (size) => random.bytes(size) })).toBe(vector.id);
		});
	}

	it('padrão: 21 símbolos do alfabeto de URL', () => {
		const id = IdUtils.short();
		expect(id).toHaveLength(21);
		expect(id).toMatch(/^[\w-]+$/);
	});

	it('valida opções', () => {
		expect(() => IdUtils.short({ size: 0 })).toThrow(RangeError);
		expect(() => IdUtils.short({ alphabet: 'a' })).toThrow(RangeError);
	});
});
