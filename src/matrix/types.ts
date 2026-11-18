/** The subset of the array API a matrix buffer must have (arrays and typed arrays fit). */
type TMatrixBuffer<T> = {
	[index: number]: T;
	/** Number of cells. */
	length: number;
	/** Copy of a range. */
	slice(start?: number, end?: number): TMatrixBuffer<T>;
	/** Fills a range. */
	fill(value: T, start?: number, end?: number): TMatrixBuffer<T>;
	/** Cells as text. */
	join(separator?: string): string;
	/** Folds the cells. */
	reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U): U;
	/** Maps the cells. */
	map(callbackfn: (value: T, index: number) => T, thisArg?: any): TMatrixBuffer<T>;
	/** Visits the cells. */
	forEach(callbackfn: (value: T, index: number) => void, thisArg?: any): void;
};

/** Constructor of a buffer of a given length. */
type TMatrixBufferCtor<T> = new (length: number) => TMatrixBuffer<T>;

export { TMatrixBuffer, TMatrixBufferCtor };
