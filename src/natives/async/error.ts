class TimeoutError extends Error {
	override readonly name = 'TimeoutError';

	constructor(readonly ms: number) {
		super(`Tempo esgotado (${ms} ms)`);
	}
}

export { TimeoutError };
