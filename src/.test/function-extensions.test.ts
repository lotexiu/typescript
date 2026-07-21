import { describe, expect, it } from 'vitest';
import '@ts/declarations';

describe('Function.prototype.rebind', () => {
	it('binds a new `this` context, preserving normal call arguments', () => {
		function greet(this: { name: string }, greeting: string) {
			return `${greeting}, ${this.name}`;
		}
		const bound = greet.rebind({ name: 'Ada' });
		expect(bound('Hello')).toBe('Hello, Ada');
	});

	it('pre-applies extra arguments given at rebind time, before call-time arguments', () => {
		function sum(this: unknown, a: number, b: number, c: number) {
			return a + b + c;
		}
		const bound = sum.rebind(null, 1, 2);
		expect(bound(3)).toBe(6);
	});

	it('re-rebinding accumulates onto the original function instead of stacking wrappers', () => {
		function identity(this: unknown, a: number, b: number) {
			return [a, b];
		}
		const once = identity.rebind(null, 1);
		const twice = once.rebind(null, 2);
		expect((twice as any).fn).toBe(identity);
		expect(twice()).toEqual([1, 2]);
	});
});

describe('Function.prototype.thisAsParameter', () => {
	it('converts fn(this, ...args) into a method callable as this.method(...args)', () => {
		function double(value: number) {
			return value * 2;
		}
		const asMethod = double.thisAsParameter();
		expect(asMethod.call(21)).toBe(42);
	});
});

describe('Function.prototype.negate', () => {
	it('returns a function that inverts the original boolean result', () => {
		function isEven(n: number) {
			return n % 2 === 0;
		}
		const isOdd = isEven.negate();
		expect(isOdd(3)).toBe(true);
		expect(isOdd(4)).toBe(false);
	});
});
