import type { TErr, TOk, TResult } from './types';

/** Errors as values: build, transform and unwrap `{ ok, value | error }` results. */
class ResultUtils {
	/** O que foi lançado, sempre como `Error` (texto/objeto viram `Error` com `cause`). */
	static toError(thrown: unknown): Error {
		return thrown instanceof Error ? thrown : new Error(String(thrown), { cause: thrown });
	}

	/** A success. */
	static ok<T>(value: T): TOk<T> {
		return { ok: true, value };
	}

	/** A failure. */
	static err<E>(error: E): TErr<E> {
		return { ok: false, error };
	}

	/** Executa `fn`; o que ela lançar vira `{ ok: false, error }` (sempre um `Error`). */
	static attempt<T>(fn: () => T): TResult<T> {
		try {
			return ResultUtils.ok(fn());
		} catch (thrown) {
			return ResultUtils.err(ResultUtils.toError(thrown));
		}
	}

	/** Awaits `fn`; a rejection becomes a failure instead of an exception. */
	static async attemptAsync<T>(fn: () => Promise<T>): Promise<TResult<T>> {
		try {
			return ResultUtils.ok(await fn());
		} catch (thrown) {
			return ResultUtils.err(ResultUtils.toError(thrown));
		}
	}

	/** Transforms the value of a success; failures pass through. */
	static map<T, U, E>(result: TResult<T, E>, fn: (value: T) => U): TResult<U, E> {
		return result.ok ? ResultUtils.ok(fn(result.value)) : result;
	}

	/** Transforms the error of a failure; successes pass through. */
	static mapError<T, E, F>(result: TResult<T, E>, fn: (error: E) => F): TResult<T, F> {
		return result.ok ? result : ResultUtils.err(fn(result.error));
	}

	/** The value of a success, or `fallback`. */
	static unwrapOr<T, E>(result: TResult<T, E>, fallback: T): T {
		return result.ok ? result.value : fallback;
	}

	/** Valor, ou lança o erro (um `Error` é relançado como está). */
	static unwrap<T, E>(result: TResult<T, E>): T {
		if (result.ok) return result.value;
		throw result.error instanceof Error ? result.error : new Error(String(result.error), { cause: result.error });
	}
}

export { ResultUtils };
