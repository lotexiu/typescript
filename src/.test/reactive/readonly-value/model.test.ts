import { describe, it, expect, vi } from 'vitest';
import { readonlyValue } from '@tsr/readonly-value/model';

describe('readonlyValue', () => {
	it('returns the computed value', () => {
		const ro = readonlyValue(() => 42);
		expect(ro()).toBe(42);
	});

	it('computes the value only once for a normal (non-nullish) result', () => {
		const compute = vi.fn(() => 42);
		const ro = readonlyValue(compute);
		ro();
		ro();
		ro();
		expect(compute).toHaveBeenCalledOnce();
	});

	it('computes only once even when the result is undefined', () => {
		const compute = vi.fn(() => undefined);
		const ro = readonlyValue(compute);
		ro();
		ro();
		ro();
		expect(compute).toHaveBeenCalledOnce();
	});

	it('computes only once even when the result is null', () => {
		const compute = vi.fn(() => null);
		const ro = readonlyValue(compute);
		ro();
		ro();
		expect(compute).toHaveBeenCalledOnce();
	});

	it('computes only once even when the result is 0/false/"" (other falsy values)', () => {
		const compute = vi.fn(() => 0);
		const ro = readonlyValue(compute);
		ro();
		ro();
		expect(compute).toHaveBeenCalledOnce();
	});

	it('does not reflect a later external change to whatever compute closed over', () => {
		let n = 1;
		const ro = readonlyValue(() => n);
		expect(ro()).toBe(1);
		n = 2;
		expect(ro()).toBe(1);
	});

	// Regression: readonlyValue used to call compute() eagerly at creation time. The common
	// real usage is as a class field initializer that reads `this` state assigned later by the
	// constructor (e.g. `readonly match = readonlyValue(() => this.value)` with `this.value`
	// itself a constructor parameter property) — field initializers run *before* the
	// constructor body, so eager evaluation read `this.value` while it was still undefined.
	it('does not call compute() until the instance is first invoked', () => {
		const compute = vi.fn(() => 1);
		readonlyValue(compute);
		expect(compute).not.toHaveBeenCalled();
	});

	it('works when compute reads `this` state assigned by a constructor after the field initializer runs', () => {
		class Example {
			readonly value: number;
			readonly doubled = readonlyValue(() => this.value * 2);
			constructor(value: number) {
				this.value = value;
			}
		}
		const instance = new Example(21);
		expect(instance.doubled()).toBe(42);
	});
});
