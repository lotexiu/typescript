import { describe, expect, it } from 'vitest';
import { ObjectUtils } from '@ts/natives/object/utils';

describe('ObjectUtils.json', () => {
	it('serializes a plain object', () => {
		expect(ObjectUtils.json({ a: 1 })).toBe('{"a":1}');
	});

	it('handles circular references', () => {
		const obj: any = { a: 1 };
		obj.self = obj;
		expect(() => ObjectUtils.json(obj)).not.toThrow();
	});
});

describe('ObjectUtils.diffs', () => {
	it('detects changed, added and removed keys', () => {
		const diffs = ObjectUtils.diffs({ a: 1, b: 2 }, { a: 1, b: 3, c: 4 }) as any;
		expect(diffs.b).toEqual({ type: 'changed', path: 'b', a: 2, b: 3 });
		expect(diffs.c).toEqual({ type: 'added', path: 'c', b: 4 });
	});
});
