type TMatrixBuffer<T> = {
	[index: number]: T;
	length: number;
	slice(start?: number, end?: number): TMatrixBuffer<T>;
	fill(value: T, start?: number, end?: number): TMatrixBuffer<T>;
	join(separator?: string): string;
	reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U): U;
	map(callbackfn: (value: T, index: number) => T, thisArg?: any): TMatrixBuffer<T>;
	forEach(callbackfn: (value: T, index: number) => void, thisArg?: any): void;
};

type TMatrixBufferCtor<T> = new (length: number) => TMatrixBuffer<T>;

export { TMatrixBuffer, TMatrixBufferCtor };
