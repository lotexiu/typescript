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
		const matrix = new Matrix<number>();
		expect(matrix.dimensions()).toEqual([128, 128]);
		expect(matrix.size()).toBe(128 * 128);
	});

	it('accepts custom dimensions and a data class', () => {
		const matrix = new Matrix<number>([2, 3], Float64Array);
		expect(matrix.dimensions()).toEqual([2, 3]);
		expect(matrix.size()).toBe(6);
		expect(matrix.data()).toBeInstanceOf(Float64Array);
	});

	it('fills every cell with the given initial value', () => {
		const matrix = new Matrix<number>([2, 2], Array, 7);
		expect(matrix.get(0, 0)).toBe(7);
		expect(matrix.get(1, 1)).toBe(7);
	});
});

describe('Matrix.get / set (2D)', () => {
	it('reads/writes a value at the given [row, col] indexes', () => {
		const matrix = new Matrix<number>([2, 3], Array, 0);
		matrix.set(42, 1, 2);
		expect(matrix.get(1, 2)).toBe(42);
	});

	it('uses row-major layout — [row, col] maps to row * columns + col', () => {
		const matrix = new Matrix<number>([2, 3], Array, 0);
		matrix.set(1, 0, 0);
		matrix.set(2, 0, 1);
		matrix.set(3, 0, 2);
		matrix.set(4, 1, 0);
		expect(toArray(matrix.data())).toEqual([1, 2, 3, 4, 0, 0]);
	});

	it('setting one cell does not affect others', () => {
		const matrix = new Matrix<number>([2, 2], Array, 0);
		matrix.set(9, 0, 1);
		expect(matrix.get(0, 0)).toBe(0);
		expect(matrix.get(1, 0)).toBe(0);
		expect(matrix.get(1, 1)).toBe(0);
	});
});

describe('Matrix.section', () => {
	it('reads a full row for a 2D matrix', () => {
		const matrix = new Matrix<number>([2, 3], Array, 0);
		matrix.set(1, 0, 0);
		matrix.set(2, 0, 1);
		matrix.set(3, 0, 2);
		expect(toArray(matrix.section(0))).toEqual([1, 2, 3]);
	});

	it('reads the whole buffer with no fixed axes', () => {
		const matrix = new Matrix<number>([2, 2], Array, 5);
		expect(toArray(matrix.section())).toEqual([5, 5, 5, 5]);
	});

	it('works for a 3D matrix, fixing the first two axes', () => {
		const matrix = new Matrix<number>([2, 3, 4], Array, 0);
		matrix.set(1, 1, 0, 0);
		matrix.set(2, 1, 0, 1);
		matrix.set(3, 1, 0, 2);
		matrix.set(4, 1, 0, 3);
		expect(toArray(matrix.section(1, 0))).toEqual([1, 2, 3, 4]);
	});
});

describe('Matrix.data reactivity', () => {
	it('data() returns the same live buffer, updated in place after set()', () => {
		const matrix = new Matrix<number>([2, 2], Array, 0);
		const buffer = matrix.data();
		matrix.set(9, 0, 0);
		expect(buffer[0]).toBe(9);
		expect(matrix.data()).toBe(buffer);
	});

	it('notifies subscribers on every set(), even though the buffer reference is unchanged', () => {
		const matrix = new Matrix<number>([2, 2], Array, 0);
		let calls = 0;
		matrix.data.subscribe(() => calls++);
		matrix.set(1, 0, 0);
		matrix.set(2, 0, 1);
		expect(calls).toBe(2);
	});

	it('recreates the buffer when dimensions change', () => {
		const matrix = new Matrix<number>([2, 2], Array, 1);
		const before = matrix.data();
		matrix.dimensions.set([3, 3]);
		const after = matrix.data();
		expect(after).not.toBe(before);
		expect(after.length).toBe(9);
	});
});

describe('Matrix.toString', () => {
	it('renders a small 2D matrix as aligned rows', () => {
		const matrix = new Matrix<number>([2, 2], Array, 0);
		matrix.set(1, 0, 0);
		matrix.set(2, 0, 1);
		matrix.set(3, 1, 0);
		matrix.set(4, 1, 1);
		expect(matrix.toString()).toBe('1 2\n3 4');
	});

	it('pads cells to align columns by the widest value', () => {
		const matrix = new Matrix<number>([1, 2], Array, 0);
		matrix.set(1, 0, 0);
		matrix.set(100, 0, 1);
		expect(matrix.toString()).toBe('  1 100');
	});
});
