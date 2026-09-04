type TMatrixBuffer<T> = {
	[index: number]: T;
	length: number;
	fill: (value: T)=> TMatrixBuffer<T>
	slice(start?: number, end?: number): TMatrixBuffer<T>
};

type TMatrixBufferCtor<T> = new (length: number) => TMatrixBuffer<T>;


export {
	TMatrixBuffer,
	TMatrixBufferCtor,
}