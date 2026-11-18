import { describe, it, expect } from 'vitest';
import { ObjectUtils, isNull, isNullOrUndefined, isObject, json } from '@tsn-object/utils';

describe('ObjectUtils.valueFromPath', () => {
	it('returns the whole object when path is omitted', () => {
		const obj = { a: 1 };
		expect(ObjectUtils.valueFromPath(obj)).toBe(obj);
	});

	it('reads a top-level value', () => {
		expect(ObjectUtils.valueFromPath({ a: 1 }, 'a')).toBe(1);
	});

	it('reads a nested value via dotted path', () => {
		expect(ObjectUtils.valueFromPath({ a: { b: { c: 42 } } }, 'a.b.c')).toBe(42);
	});
});

describe('ObjectUtils.setValueFromPath', () => {
	it('sets a top-level value', () => {
		const obj: any = { a: 1 };
		ObjectUtils.setValueFromPath(obj, 'a', 2);
		expect(obj.a).toBe(2);
	});

	it('sets a nested value via dotted path', () => {
		const obj: any = { a: { b: { c: 1 } } };
		ObjectUtils.setValueFromPath(obj, 'a.b.c', 99);
		expect(obj.a.b.c).toBe(99);
	});

	it('returns the value that was set', () => {
		const obj: any = { a: 1 };
		expect(ObjectUtils.setValueFromPath(obj, 'a', 5)).toBe(5);
	});
});

describe('ObjectUtils.update', () => {
	it('merges updates into the object via Object.assign semantics', () => {
		const obj = { a: 1, b: 2 };
		const result = ObjectUtils.update(obj, { b: 3 });
		expect(result).toEqual({ a: 1, b: 3 });
	});

	it('mutates and returns the same reference', () => {
		const obj = { a: 1 };
		expect(ObjectUtils.update(obj, { a: 2 })).toBe(obj);
	});
});

describe('ObjectUtils.isNullOrUndefined / isNull', () => {
	it('isNullOrUndefined is true for null and undefined only', () => {
		expect(isNullOrUndefined(null)).toBe(true);
		expect(isNullOrUndefined(undefined)).toBe(true);
		expect(isNullOrUndefined(0)).toBe(false);
		expect(isNullOrUndefined('')).toBe(false);
	});

	it('isNull is true for null/undefined with no extra values given', () => {
		expect(isNull(null)).toBe(true);
		expect(isNull(undefined)).toBe(true);
		expect(isNull(0)).toBe(false);
	});

	it('isNull also matches any value listed in nullValues', () => {
		expect(isNull(-1, [-1, ''])).toBe(true);
		expect(isNull('', [-1, ''])).toBe(true);
		expect(isNull(0, [-1, ''])).toBe(false);
	});
});

describe('ObjectUtils.isObject', () => {
	it('is true for plain objects and arrays', () => {
		expect(isObject({})).toBeTruthy();
		expect(isObject([])).toBeTruthy();
	});

	it('is falsy for primitives and null', () => {
		expect(isObject(null)).toBeFalsy();
		expect(isObject(1)).toBeFalsy();
		expect(isObject('str')).toBeFalsy();
		expect(isObject(undefined)).toBeFalsy();
	});
});

describe('ObjectUtils.json', () => {
	it('stringifies compactly by default', () => {
		expect(json({ a: 1 })).toBe('{"a":1}');
	});

	it('pretty-prints with 2-space indent when compact is false', () => {
		expect(json({ a: 1 }, false)).toBe('{\n  "a": 1\n}');
	});

	it('drops circular references instead of throwing', () => {
		const obj: any = { a: 1 };
		obj.self = obj;
		expect(() => json(obj)).not.toThrow();
		expect(JSON.parse(json(obj))).toEqual({ a: 1 });
	});
});

describe('ObjectUtils.diff', () => {
	it('marks added keys', () => {
		expect(ObjectUtils.diff({}, { a: 1 })).toEqual({ a: ['ADDED', 1] });
	});

	it('marks removed keys', () => {
		expect(ObjectUtils.diff({ a: 1 }, {})).toEqual({ a: ['REMOVED', 1] });
	});

	it('marks changed primitive keys', () => {
		expect(ObjectUtils.diff({ a: 1 }, { a: 2 })).toEqual({ a: ['CHANGED', 1, 2] });
	});

	it('omits unchanged keys', () => {
		expect(ObjectUtils.diff({ a: 1, b: 2 }, { a: 1, b: 3 })).toEqual({ b: ['CHANGED', 2, 3] });
	});

	it('recurses into nested objects', () => {
		expect(ObjectUtils.diff({ a: { x: 1 } }, { a: { x: 2 } })).toEqual({
			a: { x: ['CHANGED', 1, 2] },
		});
	});

	it('returns an empty object for two identical objects', () => {
		expect(ObjectUtils.diff({ a: 1 }, { a: 1 })).toEqual({});
	});
});
