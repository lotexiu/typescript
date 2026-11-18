/** Thrown (and used as the abort reason) by `AsyncUtils.timeout` when the work takes too long. */
class TimeoutError extends Error {
	/** Always `'TimeoutError'`, so it can be told apart without `instanceof`. */
	override readonly name = 'TimeoutError';

	/** Builds the error for a limit of `ms` milliseconds (kept in `ms`). */
	constructor(readonly ms: number) {
		super(`Tempo esgotado (${ms} ms)`);
	}
}

export { TimeoutError };
