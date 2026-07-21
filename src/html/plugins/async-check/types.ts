/** The lifecycle of an `AsyncCheckPlugin` check — the pending/rejected states a purely synchronous check never needs. */
type TAsyncCheckState<TResult> =
	| { status: "idle" }
	| { status: "pending" }
	| { status: "resolved"; result: TResult }
	| { status: "rejected"; error: unknown };

/** The async check function an `AsyncCheckPlugin` wraps. */
type TAsyncCheckFn<TInput, TResult> = (input: TInput) => Promise<TResult>;

export type {
	TAsyncCheckState,
	TAsyncCheckFn,
}
