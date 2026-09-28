import { describe, it, expect } from 'vitest';
import { Matrix } from '@ts/matrix/model';
import type { TMatrixBuffer } from '@ts/matrix/types';

// TMatrixBuffer intentionally has no [Symbol.iterator] in its type (it's implemented by
// Array/typed arrays at runtime, which are iterable, but the interface doesn't declare it).
function toArray<T>(buffer: TMatrixBuffer<T>): T[] {
	const out: T[] = [];
	buffer.forEach((value) => out.push(value));
	return out;
}

describe('Matrix construction / defaults', () => {
	it('defaults to a 128x128 Array-backed matrix', () => {
		const m = new Matrix<number>();
		expect(m.dimensions()).toEqual([128, 128]);
		expect(m.size()).toBe(128 * 128);
	});

	it('accepts custom dimensions and a data class', () => {
		const m = new Matrix<number>([2, 3], Float64Array);
		expect(m.dimensions()).toEqual([2, 3]);
		expect(m.size()).toBe(6);
		expect(m.data()).toBeInstanceOf(Float64Array);
	});

	it('fills every cell with the given initial value', () => {
		const m = new Matrix<number>([2, 2], Array, 7);
		expect(m.get(0, 0)).toBe(7);
		expect(m.get(1, 1)).toBe(7);
	});
});

describe('Matrix.get / set (2D)', () => {
	it('reads/writes a value at the given [row, col] indexes', () => {
		const m = new Matrix<number>([2, 3], Array, 0);
		m.set(42, 1, 2);
		expect(m.get(1, 2)).toBe(42);
	});

	it('uses row-major layout — [row, col] maps to row * columns + col', () => {
		const m = new Matrix<number>([2, 3], Array, 0);
		m.set(1, 0, 0);
		m.set(2, 0, 1);
		m.set(3, 0, 2);
		m.set(4, 1, 0);
		expect(toArray(m.data())).toEqual([1, 2, 3, 4, 0, 0]);
	});

	it('setting one cell does not affect others', () => {
		const m = new Matrix<number>([2, 2], Array, 0);
		m.set(9, 0, 1);
		expect(m.get(0, 0)).toBe(0);
		expect(m.get(1, 0)).toBe(0);
		expect(m.get(1, 1)).toBe(0);
	});
});

describe('Matrix.section', () => {
	it('reads a full row for a 2D matrix', () => {
		const m = new Matrix<number>([2, 3], Array, 0);
		m.set(1, 0, 0);
		m.set(2, 0, 1);
		m.set(3, 0, 2);
		expect(toArray(m.section(0))).toEqual([1, 2, 3]);
	});

	it('reads the whole buffer with no fixed axes', () => {
		const m = new Matrix<number>([2, 2], Array, 5);
		expect(toArray(m.section())).toEqual([5, 5, 5, 5]);
	});

	it('works for a 3D matrix, fixing the first two axes', () => {
		const m = new Matrix<number>([2, 3, 4], Array, 0);
		m.set(1, 1, 0, 0);
		m.set(2, 1, 0, 1);
		m.set(3, 1, 0, 2);
		m.set(4, 1, 0, 3);
		expect(toArray(m.section(1, 0))).toEqual([1, 2, 3, 4]);
	});
});

describe('Matrix.data reactivity', () => {
	it('data() returns the same live buffer, updated in place after set()', () => {
		const m = new Matrix<number>([2, 2], Array, 0);
		const buffer = m.data();
		m.set(9, 0, 0);
		expect(buffer[0]).toBe(9);
		expect(m.data()).toBe(buffer);
	});

	it('notifies subscribers on every set(), even though the buffer reference is unchanged', () => {
		const m = new Matrix<number>([2, 2], Array, 0);
		let calls = 0;
		m.data.subscribe(() => calls++);
		m.set(1, 0, 0);
		m.set(2, 0, 1);
		expect(calls).toBe(2);
	});

	it('recreates the buffer when dimensions change', () => {
		const m = new Matrix<number>([2, 2], Array, 1);
		const before = m.data();
		m.dimensions.set([3, 3]);
		const after = m.data();
		expect(after).not.toBe(before);
		expect(after.length).toBe(9);
	});
});

describe('Matrix.toString', () => {
	it('renders a small 2D matrix as aligned rows', () => {
		const m = new Matrix<number>([2, 2], Array, 0);
		m.set(1, 0, 0);
		m.set(2, 0, 1);
		m.set(3, 1, 0);
		m.set(4, 1, 1);
		expect(m.toString()).toBe('1 2\n3 4');
	});

	it('pads cells to align columns by the widest value', () => {
		const m = new Matrix<number>([1, 2], Array, 0);
		m.set(1, 0, 0);
		m.set(100, 0, 1);
		expect(m.toString()).toBe('  1 100');
	});
});
