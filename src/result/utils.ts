import type { TErr, TOk, TResult } from './types';

class ResultUtils {
	/** O que foi lançado, sempre como `Error` (texto/objeto viram `Error` com `cause`). */
	static toError(thrown: unknown): Error {
		return thrown instanceof Error ? thrown : new Error(String(thrown), { cause: thrown });
	}

	static ok<T>(value: T): TOk<T> {
		return { ok: true, value };
	}

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

	static async attemptAsync<T>(fn: () => Promise<T>): Promise<TResult<T>> {
		try {
			return ResultUtils.ok(await fn());
		} catch (thrown) {
			return ResultUtils.err(ResultUtils.toError(thrown));
		}
	}

	static map<T, U, E>(result: TResult<T, E>, fn: (value: T) => U): TResult<U, E> {
		return result.ok ? ResultUtils.ok(fn(result.value)) : result;
	}

	static mapError<T, E, F>(result: TResult<T, E>, fn: (error: E) => F): TResult<T, F> {
		return result.ok ? result : ResultUtils.err(fn(result.error));
	}

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
