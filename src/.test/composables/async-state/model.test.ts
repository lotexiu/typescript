import { describe, it, expect } from 'vitest';
import { asyncState } from '@ts/composables/async-state/model';

function later<T>(value: T, ms: number): Promise<T> {
	return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function laterReject(error: unknown, ms: number): Promise<never> {
	return new Promise((_, reject) => setTimeout(() => reject(error), ms));
}

describe('asyncState', () => {
	it('starts idle: no data, not loading, no error', () => {
		const state = asyncState<number>();
		expect(state.data()).toBeUndefined();
		expect(state.loading()).toBe(false);
		expect(state.error()).toBeUndefined();
	});

	it('accepts an initial value for `data`', () => {
		const state = asyncState<number>(0);
		expect(state.data()).toBe(0);
	});
});

describe('asyncState.run', () => {
	it('sets loading during the task and clears it on success, with the result in `data`', async () => {
		const state = asyncState<number>();
		const promise = state.run(() => later(42, 10));
		expect(state.loading()).toBe(true);
		await promise;
		expect(state.loading()).toBe(false);
		expect(state.data()).toBe(42);
		expect(state.error()).toBeUndefined();
	});

	it('sets `error` and clears loading on failure, keeping the previous `data`', async () => {
		const state = asyncState<number>(1);
		await state.run(() => later(2, 10));
		await state.run(() => laterReject(new Error('boom'), 10));
		expect(state.loading()).toBe(false);
		expect((state.error() as Error).message).toBe('boom');
		expect(state.data()).toBe(2); // last successful value untouched by the failed run
	});

	it('clears a previous error at the start of a new run', async () => {
		const state = asyncState<number>();
		await state.run(() => laterReject(new Error('boom'), 5));
		expect(state.error()).toBeDefined();
		const promise = state.run(() => later(1, 10));
		expect(state.error()).toBeUndefined();
		await promise;
	});

	it('ignores a result from a stale run when a newer run has already started (race guard)', async () => {
		const state = asyncState<string>();
		const slow = state.run(() => later('slow', 30));
		const fast = state.run(() => later('fast', 10));
		await Promise.all([slow, fast]);
		expect(state.data()).toBe('fast');
		expect(state.loading()).toBe(false);
	});

	it('ignores an error from a stale run when a newer run has already succeeded', async () => {
		const state = asyncState<string>();
		const slowFailure = state.run(() => laterReject(new Error('stale'), 30));
		const fastSuccess = state.run(() => later('ok', 10));
		await Promise.all([slowFailure, fastSuccess]);
		expect(state.data()).toBe('ok');
		expect(state.error()).toBeUndefined();
	});
});
