import { describe, it, expect } from 'vitest';
// Side-effect import: this is the module that monkey-patches native prototypes
// (Function.prototype.bind included — see the finding reported alongside this suite).
// Kept in its own file so the global mutation doesn't leak into unrelated test files.
import '@ts/declarations';

describe('global String prototype extensions', () => {
	it('adds StringUtils methods directly on string instances', () => {
		expect('helloWorld'.toKebabCase()).toBe('hello-world');
		expect('hello'.capitalize()).toBe('Hello');
		expect('café'.noAccent()).toBe('cafe');
	});

	it('forwards arguments after `this` correctly', () => {
		expect('a'.isLetter()).toBe(true);
		expect('é'.isLetter(true)).toBe(true);
		expect('5'.isDigit(0)).toBe(true);
	});
});

describe('global Object prototype extensions', () => {
	it('adds valueFromPath/setValueFromPath/update/toJson', () => {
		const obj: any = { a: { b: 1 } };
		expect(obj.valueFromPath('a.b')).toBe(1);
		obj.setValueFromPath('a.b', 2);
		expect(obj.a.b).toBe(2);
		obj.update({ c: 3 });
		expect(obj.c).toBe(3);
		expect(obj.toJson(true)).toBe(JSON.stringify(obj));
	});
});

describe('global Function prototype extensions', () => {
	it('adds thisAsParameter', () => {
		// `self` here, not `this` — a parameter literally named `this` is a TS this-parameter
		// annotation and gets erased at compile time, so it would never receive a real argument.
		function fn(self: any, a: number) {
			return [self, a];
		}
		const wrapped = fn.thisAsParameter();
		const ctx = { tag: 'ctx' };
		expect(wrapped.call(ctx, 1)).toEqual([ctx, 1]);
	});

	it('overrides bind() to go through FunctionUtils.rebind', () => {
		function greet(this: { name: string }, greeting: string) {
			return `${greeting}, ${this.name}`;
		}
		const bound = greet.bind({ name: 'Ada' });
		expect(bound('Hi')).toBe('Hi, Ada');
	});

	it('the overridden bind() attaches `origin`/`children` (FunctionUtils.rebind contract)', () => {
		function original() {}
		const bound = original.bind(null) as any;
		expect(bound.origin).toBe(original);
		expect(bound.children).toBe(original);
	});
});
